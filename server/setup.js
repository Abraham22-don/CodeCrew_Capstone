import { readFile } from 'node:fs/promises';
import { pool } from './db.js';
try {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('Tables and demo user are ready. Existing records were preserved.');
} catch (error) {
  console.error('Database setup failed:', error.code || error.message);
  process.exitCode = 1;
} finally { await pool.end(); }
