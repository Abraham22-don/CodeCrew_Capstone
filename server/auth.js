/**
 * Shared-workspace authentication: one access code, no individual accounts.
 * Only an opaque, signed session ID goes into the browser's HttpOnly cookie.
 * Session contents live in PostgreSQL and expire after eight hours.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { rateLimit } from 'express-rate-limit';

export const COOKIE_NAME = 'codecrew.sid';
const SESSION_MS = 8 * 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest();

/** Fail closed if required secrets were not configured; never ship default secrets. */
export function readAuthConfig(env = process.env) {
  const accessCode = env.ACCESS_CODE || '';
  const sessionSecret = env.SESSION_SECRET || '';
  if (accessCode.length < 16 || accessCode.length > 256 || accessCode.includes('replace_')) {
    throw new Error('Set ACCESS_CODE to a private value of 16–256 characters in the backend environment.');
  }
  if (sessionSecret.length < 32 || sessionSecret.includes('replace_') || sessionSecret === accessCode) {
    throw new Error('Set SESSION_SECRET to a separate random value of at least 32 characters.');
  }
  const production = env.NODE_ENV === 'production';
  return { accessCode, sessionSecret, production, trustProxy: env.TRUST_PROXY === '1' };
}

/** Reusable authorization guard used by every coursework endpoint. */
export function requireAuth(req, res, next) {
  if (req.session?.authenticated !== true || !Number.isFinite(req.session.signedInAt) || Date.now() - req.session.signedInAt >= SESSION_MS) {
    return res.status(401).json({ error: 'Please sign in to access your workspace.' });
  }
  next();
}

/**
 * Reject browser cross-origin mutations. The custom header requires a CORS
 * preflight, and this same-origin app intentionally does not grant CORS access.
 * JSON-only POST/PUT/PATCH prevents ordinary cross-site form submissions.
 */
export function requireAppRequest(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Hub-Request') !== '1') return res.status(403).json({ error: 'Request must come from the workspace application.' });
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Send request data as application/json.' });
  }
  next();
}

/** Attach PostgreSQL sessions and public sign-in / protected session routes. */
export function installAuth(app, db, config) {
  const PgStore = connectPgSimple(session);
  const store = new PgStore({
    pool: db,
    tableName: 'app_sessions',
    createTableIfMissing: false, // Created explicitly by npm run db:setup.
    disableTouch: true, // Fixed expiry; activity does not extend the eight hours.
    pruneSessionInterval: 15 * 60,
    errorLog: () => console.error('Session storage failed.'),
  });
  if (config.trustProxy) app.set('trust proxy', 1); // Only for a trusted single reverse proxy.
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', session({
    name: COOKIE_NAME,
    secret: config.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure: config.production, maxAge: SESSION_MS, path: '/' },
  }));

  // Limit attempts per IP, including successful attempts, within one server process.
  // A multi-instance deployment would need a shared rate-limit store.
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
    // Hash to fixed-size buffers for timingSafeEqual; this is not account-password storage.
    if (!timingSafeEqual(digest(accessCode), digest(config.accessCode))) {
      return res.status(401).json({ error: 'Incorrect access code.' });
    }
    // Replace any existing session ID to prevent session fixation.
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.authenticated = true;
    req.session.signedInAt = Date.now();
    // Persist before replying so the next request sees the session immediately.
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.json({ authenticated: true });
  });
  app.get('/api/auth/session', requireAuth, (req, res) => res.json({ authenticated: true }));
  app.post('/api/auth/logout', requireAuth, requireAppRequest, async (req, res) => {
    // Deleting the database session invalidates replay of the old cookie.
    await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict', secure: config.production, path: '/' });
    res.status(204).end();
  });
  return store;
}
