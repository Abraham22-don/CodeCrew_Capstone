/** Start the session-protected API and serve the production React build. */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { pool } from './db.js';
// createApp validates ACCESS_CODE and SESSION_SECRET before opening a listening port.
const app = createApp(pool);
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
// Serve the built React app and its client-side routes from the same origin.
app.use(express.static(dist));
app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`API running at http://${process.env.HOST || '127.0.0.1'}:${port}`));
// Close the session-pruning timer and pool when the server stops.
async function shutdown() { server.close(async () => { app.locals.sessionStore.close(); await pool.end(); process.exit(0); }); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
