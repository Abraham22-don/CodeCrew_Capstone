/** starts the hub server, server handles API requests and serves the React app */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { pool } from './db.js';

// give API access to postgreSQL pool through shared connection
// checks access code and session secret before server starts
const app = createApp(pool);

//react build saves files in dist folder
//find folder relative to this file instead of cwd so it works regardless of cd
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

// send browser the files it wants
app.use(express.static(dist));

//if GET request reaches here,, send react app's start page
//lets someone refresh the page or enter a URL and still get the app instead of 404
app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));

// HOST and PORT control where the server listens. If neither is set,
// the app is available on this computer at http://127.0.0.1:3000.
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`API running at http://${process.env.HOST || '127.0.0.1'}:${port}`));

// Stop accepting new connections and let active requests finish before
// closing the resources those requests might still need.
async function shutdown() { 
    server.close(async () => { 

        app.locals.sessionStore.close(); //stop timer that regularly prunes expired sessions

        await pool.end(); // close db connections, exit with 0 for success
        process.exit(0); }); 
}

// sigint on ctrl-c. host can sigterm when it stops or restarts app. 
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
