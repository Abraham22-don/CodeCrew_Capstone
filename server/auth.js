/**
 * Handles sign-in for the shared Student Productivity Hub workspace.
 * Everyone signs in with the same access code. After sign-in, the browser
 * keeps a cookie with a signed session ID. The API uses that ID to look up
 * the session in PostgreSQL. Each sign-in lasts up to eight hours.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { rateLimit } from 'express-rate-limit';

export const COOKIE_NAME = 'codecrew.sid';
const SESSION_MS = 8 * 60 * 60 * 1000; //8 hour cookie time

//turn an access code into a fixed length value for sign in comparison
const digest = value => createHash('sha256').update(value).digest();

/** read and check two secret values from env*/
/** Access code is entered on sign in, session secret stays on the server and can detect changes */
export function readAuthConfig(env = process.env) {
  const accessCode = env.ACCESS_CODE || '';
  const sessionSecret = env.SESSION_SECRET || '';

  // catch missing values and example values copied from example env file
  if (accessCode.length < 16 || accessCode.length > 256 || accessCode.includes('replace_')) {
    throw new Error('Set ACCESS_CODE to a private value of 16–256 characters in the backend environment.');
  }
  if (sessionSecret.length < 32 || sessionSecret.includes('replace_') || sessionSecret === accessCode) {
    throw new Error('Set SESSION_SECRET to a separate random value of at least 32 characters.');
  }
  const production = env.NODE_ENV === 'production';
  return { accessCode, sessionSecret, production, trustProxy: env.TRUST_PROXY === '1' };
}

/** check session before allowing access to protected route,
 * 401 tells front end to ask for sign in
 * next() lets the request continue to the next route handler if session is valid
*/
export function requireAuth(req, res, next) {
  if (req.session?.authenticated !== true || !Number.isFinite(req.session.signedInAt) || Date.now() - req.session.signedInAt >= SESSION_MS) {
    return res.status(401).json({ error: 'Please sign in to access your workspace.' });
  }
  next();
}

/** check request that can change workspace data, such as add or delete
 * frontend sends X-hub-request header
 * browser on another site needs permission to send that header
 */
export function requireAppRequest(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Hub-Request') !== '1') return res.status(403).json({ error: 'Request must come from the workspace application.' });
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Send request data as application/json.' });
  }
  next();
}

/** set up session storage and sign in, check session, and sign out routes */
export function installAuth(app, db, config) {

  //use existing postgreSQl connection pool to read and save session data
  const PgStore = connectPgSimple(session);
  const store = new PgStore({
    pool: db,
    tableName: 'app_sessions',
    createTableIfMissing: false, // Created explicitly by npm run db:setup.
    disableTouch: true, // browsing does not restart session timer
    pruneSessionInterval: 15 * 60, //interval for cleaning expired rows
    errorLog: () => console.error('Session storage failed.'),
  });

  //when configured, ttrust proxy in front of express so 
  //app can recognize https connections handled by host service
  if (config.trustProxy) app.set('trust proxy', 1); // Only for a trusted single reverse proxy.
  
  //tell browsers and other caches to avoid storing copies of api responses
  app.use('/api', (req, res, next) => { 
    
    res.set('Cache-Control', 'no-store'); 
    next(); 
  });

  // make session available as req.session on api requests
  app.use('/api', session({
    name: COOKIE_NAME,
    secret: config.sessionSecret,
    store,
    resave: false, //skip rewriting a session when nothing changes
    saveUninitialized: false, //wait for app to add data before saving new session 
    cookie: { 
      httpOnly: true, //keep js from reading cookie
      sameSite: 'strict', //keep browser from sending it on cross site requests
      secure: config.production, //requires https for cookie in production
      maxAge: SESSION_MS, 
      path: '/' 
    },

  }));

  // limit sign in attempts to 10 per 15 minute windows
  // successfull attempts count, server keeps count
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' },
  });

  app.post('/api/auth/login', loginLimiter, requireAppRequest, async (req, res) => {
    const accessCode = req.body?.accessCode;
    if (typeof accessCode !== 'string' || accessCode.length > 256 || !accessCode) {
      return res.status(400).json({ error: 'Enter the workspace access code.' });
    }

    // compare fixed length hashes. timingsafeequal avoids
    //revealing through comparison time how much of the values matched
    if (!timingSafeEqual(digest(accessCode), digest(config.accessCode))) {
      return res.status(401).json({ error: 'Incorrect access code.' });
    }

    // give brower fresh session id after successful sign-in
    //wait before recording sign in time
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.authenticated = true;
    req.session.signedInAt = Date.now();

    // save session before replying so frontend can request protected data using new ID
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.json({ authenticated: true });
  });

  //frontend calls when page loads to check if browser still has valid session
  //requireAuth handles expired 
  app.get('/api/auth/session', requireAuth, (req, res) => {
    res.json({ authenticated: true });
  });

  app.post('/api/auth/logout', requireAuth, requireAppRequest, async (req, res) => {

    //delete session from PostgreSQL so the old ID stops granting access
    await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));

    //tell browser to remove cookie, 204 means sign-out
    // succeeded and there is no response body to read
    res.clearCookie(COOKIE_NAME, { httpOnly: true, 
      sameSite: 'strict', 
      secure: config.production, 
      path: '/' 
    });
    res.status(204).end();
  });

  //server uses this to stop cleanup timer
  return store;
}
