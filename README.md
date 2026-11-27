# CodeCrew — Student Productivity Hub

**Live application:** https://codecrew-capstone.onrender.com

**GitHub repository:** https://github.com/Abraham22-don/CodeCrew_Capstone

CodeCrew helps college students organize courses, manage assignments, review upcoming deadlines, and track completion. The React frontend and Express API run together on Render, with persistent PostgreSQL storage on Neon. Request the workspace access code privately from the team; credentials are not published in this repository.

Adapted from the supplied CodeCrew React frontend. The existing dark colors, navigation styling, and cards are retained. The app now uses coursework data and a PostgreSQL-backed Express API.

## Included

- Three routed pages: `/dashboard`, `/assignments`, `/progress`.
- Add courses, then add assignments with title, course, due date, status, and optional description.
- View details, edit, delete (with confirmation), mark complete, or change status.
- Search by title/description and filter by course/status.
- Dashboard lists overdue and upcoming unfinished work, sorted by due date.
- Progress shows completed/total assignments overall and per course.
- Loading, empty, success, and error states. Failed saves retain form entries.
- PostgreSQL primary keys, foreign keys, validation, and parameterized SQL queries.

This version uses one shared workspace with an access-code sign-in. A valid server session is required for all coursework reads and writes. There are no individual accounts or user-specific workspaces. Everyone with the code has the same access. Calendar, notifications, AI features, and chart libraries remain outside scope.

## Technology stack

- React and React Router provide the interface and client-side routing.
- Vite builds the frontend and proxies API requests during development.
- Node.js and Express provide the JSON API and serve the production frontend.
- PostgreSQL on Neon stores courses, assignments, and sessions.
- `pg`, `express-session`, and `connect-pg-simple` connect database queries and authentication sessions to PostgreSQL.
- Render hosts the application; GitHub stores the client and server source.

## 1. Clone and install

Use Node.js 22.12 or newer (Node 24 is used in the deployment configuration). Clone the repository and select the branch containing the full-stack version. Use `CodeCrew-Ver2` if it has not yet been merged into `main`.

```powershell
git clone https://github.com/Abraham22-don/CodeCrew_Capstone.git
cd CodeCrew_Capstone
```

## 2. Create a local PostgreSQL database in pgAdmin

For an isolated development database, use a local PostgreSQL server. In pgAdmin, right-click **Databases → Create → Database**. Name it:

`student_productivity_hub`

Save the new database. Alternatively, use a separate Neon development database by setting `DATABASE_URL` in your local `.env`.

## 3. Configure and install

Use Node.js 22.12 or newer. Open PowerShell in the project root. Run commands one at a time:

```powershell
npm install
# Run only if you do not already have a .env file.
Copy-Item .env.example .env
```

Edit `.env` locally. Set `PGPASSWORD` to your PostgreSQL password and adjust `PGUSER` or `PGPORT` if your installation differs. Keep `PGDATABASE=student_productivity_hub`.

Do not commit `.env`. Only the backend reads these settings; never put database secrets in `VITE_` variables.

Before starting the API, set `ACCESS_CODE` to a private value of 16–256 characters and `SESSION_SECRET` to a different random value of at least 32 characters. Do not leave the `replace_` placeholders. For local HTTP development use `NODE_ENV=development` and `TRUST_PROXY=0`.

You can generate two independent random values locally by running this twice (never paste the results into chat or commit them):

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use the first as `ACCESS_CODE` and the second as `SESSION_SECRET` in `.env`.

Create the tables and demo user:

```powershell
npm run db:setup
```

Expected: `Tables and demo user are ready. Existing records were preserved.`

The schema creates `users`, `courses`, `assignments`, and `app_sessions`. The session table stores signed-in session data and expiry timestamps, not the access code. User → Course and Course → Assignment are one-to-many relationships. Setup is repeatable and does not erase existing data. No courses or assignments are seeded: create real course names in the UI.

## 4. Run the app (two terminals)

Terminal 1 — leave the API running:

```powershell
npm run server
```

Terminal 2 — leave Vite running:

```powershell
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The API defaults to `http://127.0.0.1:3000`. Vite forwards `/api` requests there. If you change the API port, change the proxy in `vite.config.js` too.

Verify the actual database connection from a third terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/health
```

Expected: `status: ok`, `database: connected`.

If requests fail, check that PostgreSQL is running, `.env` credentials match, the new database exists, and `npm run db:setup` succeeded. Restart the API after editing `.env`.

## 5. Workflow A: Create and manage assignments

1. Sign in with the configured workspace access code. Open Assignments and add a course such as Operating Systems.
2. Click Add Assignment. Enter a title, course, due date, status, and description.
3. Save. Confirm the success message and new card.
4. Refresh the browser and verify the assignment remains.
5. Open View details, then Edit and change the due date/title. Save.
6. Change status or click Mark complete. Verify Dashboard and Progress totals update.
7. Filter by course and status. Review upcoming and overdue work on Dashboard.
8. Delete a test assignment and confirm it is still absent after refreshing.
9. Stop and restart the API. Confirm remaining assignments still exist.

## Workflow B: Find upcoming work and track progress

1. Open Dashboard to review upcoming and overdue unfinished assignments.
2. Open Assignments and filter by course or completion status; search by title or description.
3. Open an assignment to review its details and change its status.
4. Open Progress to see completion totals overall and per course.
5. Refresh to verify that the saved status remains.

Dates are calendar dates, not times. An unfinished assignment is overdue when its date is before the browser's local calendar date. Today counts as upcoming. Overall progress is completed count / total count, not an estimate of partial completion. Statistics are for all coursework; list filters do not change overall totals.

## Authentication and route protection

The `/login` page submits `{ "accessCode": "your local secret" }` to `POST /api/auth/login`. On success, Express regenerates the session ID, saves authentication state in PostgreSQL, and sets an HttpOnly, SameSite=Strict cookie. Sessions expire eight hours after sign-in. The cookie contains an opaque signed ID; React cannot read it and does not store credentials in localStorage.

`GET /api/auth/session` verifies the current session. `POST /api/auth/logout` destroys it and clears the cookie. `requireAuth` protects all course and assignment endpoints and the session/logout routes. The health endpoint and login endpoint are public. API requests without a valid session receive 401 before coursework handlers execute.

React's `ProtectedRoute` redirects unauthenticated visitors to `/login`. On sign-in, the app returns to a known requested page. A 401 during a data request clears the protected view and redirects to sign-in; loaded coursework and unsaved form state are discarded. Other failures show the existing error messages. A database/network outage during the initial session check displays a retry view, rather than pretending the user is authenticated. Session expiry is detected on the next protected request or reload, not by continuous polling.

Every mutation requires `X-Hub-Request: 1`; POST/PUT/PATCH also require JSON. The frontend helper supplies both. No cross-origin CORS permissions are granted. This custom header plus the same-site cookie prevents ordinary cross-site browser form/fetch requests from mutating data. Command-line clients must send the header, JSON, and the valid cookie too; the header itself is not authentication.

Sign-in is limited to ten attempts per IP per 15 minutes in one server process. Multiple instances require a shared rate-limit store. Everyone with the code shares the same permission level. There is no ownership isolation or identity audit for separate users.

## API reference

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/auth/login | Public code verification; JSON `{ "accessCode": "..." }` |
| GET | /api/auth/session | Protected session verification |
| POST | /api/auth/logout | Protected sign-out; send `{}` |
| GET | /api/health | Public database reachability |
| GET | /api/courses | List demo user's courses |
| POST | /api/courses | Create course: `{ "course_name": "Operating Systems" }` |
| GET | /api/assignments | List assignments; optional `course_id` and `status` query parameters |
| GET | /api/assignments/:id | Read details |
| POST | /api/assignments | Create assignment |
| PUT | /api/assignments/:id | Replace editable fields |
| PATCH | /api/assignments/:id/status | Change status: `{ "status": "Completed" }` |
| DELETE | /api/assignments/:id | Delete assignment; returns 204 |

All coursework endpoints in the table require a valid session cookie. Mutation requests require the custom header described above.

POST/PUT assignment fields: `title`, `course_id`, `due_date` (`YYYY-MM-DD`), `status`, optional `description`. Status must be `Not Started`, `In Progress`, or `Completed`. Invalid data returns 400, missing records 404, duplicate course names 409, and database failures 500. Course IDs must exist. SQL values are passed as parameters, not interpolated into query strings.

## Tests and build

```powershell
npm test
npm run build
```

Automated API tests use PGlite, an embedded PostgreSQL engine, with temporary on-disk data. They exercise authenticated CRUD, filtering, validation, foreign keys, duplicate names, missing records, dates, errors, and persistence after reopening the database. Authentication tests cover unauthenticated endpoint rejection, bad/forged credentials, session persistence across fresh server instances, regeneration, expiry, logout, production cookie flags, cross-site mutation checks, attempt limits, and missing-secret startup failure. They do not verify your local PostgreSQL credentials or a hosted deployment.

After building, `npm start` serves both the API and built frontend at port 3000. Direct navigation to the three pages is supported. `npm run preview` previews the frontend and still needs the API running.

## Database structure

| Table | Purpose and relationships |
| --- | --- |
| `users` | Stores the seeded shared-workspace user. One user has multiple courses. |
| `courses` | Stores course names and a foreign key to the user. One course has multiple assignments. |
| `assignments` | Stores titles, due dates, statuses, descriptions, and a foreign key to the course. |
| `app_sessions` | Stores server-side session data and expiration timestamps. |

The seeded user represents the shared workspace; it is not an individual account registration system.

## Deployment: Render + Neon

The deployed application is available at **https://codecrew-capstone.onrender.com**. Render serves the compiled React frontend and Express API from the same origin. Neon supplies the persistent PostgreSQL database, including session storage.

### Initialize Neon

Create a Neon project and copy its PostgreSQL connection string from the Connect dialog. Preserve the provider's SSL options. Set `DATABASE_URL` in a private local `.env` to initialize that database:

```powershell
npm run db:setup
```

This repeatable setup creates the tables and shared-workspace user without clearing existing records. It does not transfer courses or assignments from a local database. When finished, restore your development database settings if local development should remain separate from production. Never disable certificate verification to work around connection errors.

### Configure the Render web service

Connect the GitHub repository to a Node web service. Select the branch containing the full-stack application (`CodeCrew-Ver2`, or `main` after merging).

| Setting | Value |
| --- | --- |
| Root directory | Repository root; leave blank when `package.json` is at the root. |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `node server/index.js` |
| Health check path | `/api/health` |

Use the direct Node start command on Render. The current `npm start` script loads a local `.env` file, whereas Render injects environment variables through its service settings.

Set the following in Render's environment settings:

| Variable | Configuration |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string, including SSL options. |
| `ACCESS_CODE` | Private shared workspace code, 16–256 characters. |
| `SESSION_SECRET` | Separate random secret, at least 32 characters. |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `1` for the configured reverse proxy. |
| `NODE_VERSION` | `24` |

Render provides `PORT`. Do not upload `.env` or expose secrets through `VITE_` variables. Keep production secrets separate from development where possible. Team members using the hosted app need its URL and access code; they do not need the database connection string or session secret.

### Deployment verification

Jordan reported successful assignment persistence after refresh and successful sign-out on the deployed application on November 24, 2026. These are manual checks, separate from the automated API tests.

For a complete demo check:

1. Open the live application and sign in.
2. Create a course and assignment, then refresh to confirm persistence.
3. Edit the assignment and mark it complete; verify the progress totals.
4. Delete a temporary test assignment and confirm it stays deleted after refresh.
5. Sign out and directly visit `/dashboard`; confirm redirection to login.
6. Request `/api/assignments` without a session; confirm HTTP 401.
7. Open `/api/health`; expect `{"status":"ok","database":"connected"}`.

Only the persistence and sign-out checks above have been explicitly reported for the hosted deployment; retain evidence when completing the remaining checks.

## Main files

- `src/App.jsx`: loads shared data and updates state after confirmed API writes.
- `src/pages/Workspace.jsx`: Dashboard, Assignments, and Progress page views.
- `src/components/AssignmentForm.jsx`: controlled add/edit form.
- `src/components/AssignmentCard.jsx`: details, status changes, edit and delete controls.
- `src/api.js`: shared request and date helpers.
- `src/App.css`: original CodeCrew styles; `src/hub.css`: additions for coursework.
- `server/app.js`: API routes and error handling.
- `server/db.js`: PostgreSQL connection pool.
- `server/schema.sql`: tables, constraints, indexes, and demo user.
- `server/setup.js`: repeatable schema setup.
- `tests/api.test.js`: automated API tests.

Implementation references: https://node-postgres.com/features/queries and https://vite.dev/config/server-options#server-proxy

## Authentication files and documentation

- `server/auth.js`: configuration validation, PostgreSQL session store, sign-in, attempt limiter, authorization and mutation-request guards, sign-out.
- `src/auth/AuthContext.jsx`: shared session verification and sign-in/out state.
- `src/auth/ProtectedRoute.jsx`: guarded React routes and retry/redirect behavior.
- `src/pages/Login.jsx`: controlled access-code form and sign-in errors.
- `tests/auth.test.js`: authentication and session integration tests.
- `AUTH_UPDATE.md`: installation instructions, changed-file documentation, manual checks, and scope.
- `PROJECT_STATUS.md`: current rubric status and remaining evidence gaps.

## Roles and workflows

One role exists: authenticated shared-workspace participant. A visitor without the code can see the login page and public health endpoint but cannot read or mutate coursework. A participant can create courses, create/edit/delete assignments, change statuses, filter coursework, and review deadlines/completion. There are no separate administrator/student roles.

## AI assistance disclosure

ChatGPT assisted with adapting the supplied React UI, implementing the Express/PostgreSQL integration, adding the authentication and protected sessions, and creating automated tests. Jordan performed the reported local PostgreSQL setup and coursework workflow checks, configured the Render and Neon deployment, and reported successful hosted persistence and sign-out checks. ChatGPT also assisted with deployment instructions and this README. Each team member should review the generated code and describe their own contributions accurately.

Authentication implementation references: https://expressjs.com/en/resources/middleware/session/ and https://github.com/voxpelli/node-connect-pg-simple

## Individual contributions and submission evidence

Use Git history and pull requests to document each student's work. Each member should provide their name, the features or files they implemented or reviewed, relevant commit or PR links, and testing performed. Contributions from other members are not inferred from the repository owner or branch names.

Before final submission, add the complete team roster and individual contribution summaries, retain workflow test evidence, and provide the instructor with the live URL and access code through a private course-approved channel.
