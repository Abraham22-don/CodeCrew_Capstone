# Student Productivity Hub — CodeCrew core implementation

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

This version uses one shared demo user and has no login, calendar, notifications, AI features, or chart library. Every visitor to the same instance shares the workspace. Run locally for development; do not treat it as a private multi-user service.

## 1. Put the files in your repository

Create a fresh branch after committing your existing work and updating your main branch. Copy this folder's contents into the repository root, including `.gitignore` and `.env.example`. Do not create an extra nested project folder. Review changed files before committing. The new `src/App.jsx` no longer imports the previous Home/About/Dashboard pages; old unused files may be removed after verifying the new app. The new package manifest uses compatible React/Vite dependencies and includes a lockfile; review it alongside your team's previous package.json before merging.

## 2. Create a local PostgreSQL database in pgAdmin

Use your existing PostgreSQL server from the previous assignment. In pgAdmin, right-click **Databases → Create → Database**. Name it:

`student_productivity_hub`

Save. This is a new database; do not replace your `os_study_board` database.

## 3. Configure and install

Use Node.js 22.12 or newer. Open PowerShell in the project root. Run commands one at a time:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` locally. Set `PGPASSWORD` to your PostgreSQL password and adjust `PGUSER` or `PGPORT` if your installation differs. Keep `PGDATABASE=student_productivity_hub`.

Do not commit `.env`. Only the backend reads these settings; never put database secrets in `VITE_` variables.

Create the tables and demo user:

```powershell
npm run db:setup
```

Expected: `Tables and demo user are ready. Existing records were preserved.`

The schema creates `users`, `courses`, and `assignments`. User → Course and Course → Assignment are one-to-many relationships. Setup is repeatable and does not erase existing data. No courses or assignments are seeded: create real course names in the UI.

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

## 5. First complete workflow

1. Open Assignments. Add a course such as Operating Systems.
2. Click Add Assignment. Enter a title, course, due date, status, and description.
3. Save. Confirm the success message and new card.
4. Refresh the browser and verify the assignment remains.
5. Open View details, then Edit and change the due date/title. Save.
6. Change status or click Mark complete. Verify Dashboard and Progress totals update.
7. Filter by course and status. Review upcoming and overdue work on Dashboard.
8. Delete a test assignment and confirm it is still absent after refreshing.
9. Stop and restart the API. Confirm remaining assignments still exist.

Dates are calendar dates, not times. An unfinished assignment is overdue when its date is before the browser's local calendar date. Today counts as upcoming. Overall progress is completed count / total count, not an estimate of partial completion. Statistics are for all coursework; list filters do not change overall totals.

## API reference

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Confirm database reachability |
| GET | /api/courses | List demo user's courses |
| POST | /api/courses | Create course: `{ "course_name": "Operating Systems" }` |
| GET | /api/assignments | List assignments; optional `course_id` and `status` query parameters |
| GET | /api/assignments/:id | Read details |
| POST | /api/assignments | Create assignment |
| PUT | /api/assignments/:id | Replace editable fields |
| PATCH | /api/assignments/:id/status | Change status: `{ "status": "Completed" }` |
| DELETE | /api/assignments/:id | Delete assignment; returns 204 |

POST/PUT assignment fields: `title`, `course_id`, `due_date` (`YYYY-MM-DD`), `status`, optional `description`. Status must be `Not Started`, `In Progress`, or `Completed`. Invalid data returns 400, missing records 404, duplicate course names 409, and database failures 500. Course IDs must exist. SQL values are passed as parameters, not interpolated into query strings.

## Tests and build

```powershell
npm test
npm run build
```

Automated API tests use PGlite, an embedded PostgreSQL engine, with temporary on-disk data. They exercise CRUD, filtering, validation, foreign keys, duplicate names, missing records, date validation, errors, and data persistence after reopening the database. They do not verify your local PostgreSQL credentials or a hosted deployment.

After building, `npm start` serves both the API and built frontend at port 3000. Direct navigation to the three pages is supported. `npm run preview` previews the frontend and still needs the API running.

## Local versus cloud requirement

Local PostgreSQL through pgAdmin works for development and testing. It does **not** satisfy the proposal's hosted/cloud database requirement by itself. Once your team selects an approved provider, set its `DATABASE_URL` in the backend environment (with provider-required TLS verification), run `npm run db:setup` against that database, and restart the API. Existing local data is not automatically moved. Do not disable certificate validation as a workaround.

For deployment, use the host's secret/environment settings and set `HOST=0.0.0.0` if needed; the local default is `127.0.0.1`. Add account isolation/authentication before storing private data in a public instance.

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
