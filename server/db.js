
/** set up postgresql connection pool used by hub */

import pg from 'pg'; // pool lets API reuse connections instead of opening a new one for every request

// pg uses PGHOST, PGPORT, PGDATABASE, PGUSER and PGPASSWORD by default.
export const pool = new pg.Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}),

  //wait 5 seconds for connection
  connectionTimeoutMillis: 5000,
  //timeout after 10 seconds
  statement_timeout: 10000,
});

//log error if connetion fails while waiting for request
pool.on('error', () => console.error('An idle database connection failed.'));
