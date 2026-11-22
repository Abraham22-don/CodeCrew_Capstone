# Verification record

## Completed checks

- `npm run build`: passed; React routes/components compiled and CSS bundled.
- `npm test`: 3 tests passed, 0 failed.
- API integration test exercised the actual SQL schema in a temporary disk-backed PGlite PostgreSQL engine:
  - Repeatable schema creation without wiping existing tables.
  - Database health response, empty initial list, course creation and duplicate rejection.
  - Assignment creation, read by ID, edit, course/status filters, status change and deletion.
  - Required fields, title length, invalid status, invalid course ID, invalid description, and impossible dates.
  - Foreign-key rejection for missing courses; 404 responses for missing assignments.
  - Data retained after closing and reopening the database.
  - Malformed JSON and unknown API routes.
- Separate tests cover leap-year dates and generic database-error responses that do not expose secrets.

## Still to verify on your machine

- Native PostgreSQL setup/connection through pgAdmin and the pg connection pool. No user database credentials were supplied or used here.
- Browser workflow and visual checks. Automated Chromium launch was blocked by the execution environment before UI tests could run. Use the checklist in README.md.
- Hosted PostgreSQL/cloud deployment. This package supports a backend DATABASE_URL but no hosted database has been provisioned.

The test-only PGlite dependency is not used by the running application. Runtime data uses PostgreSQL through `pg`.
