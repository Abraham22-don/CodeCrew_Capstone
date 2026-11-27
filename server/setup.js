
/** sets up hub db by running schema.sql against PostgreSQL. Run with npm run db:setup */

import { readFile } from 'node:fs/promises';
import { pool } from './db.js';

try {

  // locate schema.sql relative to the script instead of directory so it runs regardless of cd. 
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));

  console.log('Tables and demo user are ready. Existing records were preserved.');

} catch (error) {

  //report file or db error and mark as failed. 
  console.error('Database setup failed:', error.code || error.message);
  process.exitCode = 1;

  // close connect whether db setup fails or succeeds
} finally { await pool.end(); }
