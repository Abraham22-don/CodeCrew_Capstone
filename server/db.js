import pg from 'pg';
// pg uses PGHOST, PGPORT, PGDATABASE, PGUSER and PGPASSWORD by default.
export const pool = new pg.Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}),
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
});
pool.on('error', () => console.error('An idle database connection failed.'));
