/** Express coursework API. Authentication runs before all course/assignment handlers.
 * Validation and parameterized SQL continue to protect data integrity after sign-in.
 */
import express from 'express';
import { installAuth, readAuthConfig, requireAuth, requireAppRequest } from './auth.js';
import { assignmentError, validId, statuses } from './validation.js';
const selectAssignment = `SELECT a.assignment_id, a.title, to_char(a.due_date, 'YYYY-MM-DD') AS due_date,
 a.status, a.description, a.course_id, c.course_name FROM assignments a JOIN courses c USING (course_id)`;

// Inject the pool so the API can also be integration-tested against a test database.
export function createApp(db, authConfig = readAuthConfig()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', async (req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  });

  // Health stays public for deployment checks. All remaining data routes require a session.
  app.locals.sessionStore = installAuth(app, db, authConfig);
  app.use('/api', requireAuth, requireAppRequest);
  app.get('/api/courses', async (req, res) => {
    res.json((await db.query(`SELECT course_id, course_name FROM courses WHERE user_id =
      (SELECT user_id FROM users WHERE email = 'demo@student.example') ORDER BY course_name`)).rows);
  });

  // Course form: validate the name and assign this shared workspace's demo user.
  app.post('/api/courses', async (req, res) => {
    const name = req.body?.course_name;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) return res.status(400).json({ error: 'Course name must contain 1–100 characters.' });
    const result = await db.query(`INSERT INTO courses (course_name, user_id)
      VALUES ($1, (SELECT user_id FROM users WHERE email = 'demo@student.example')) RETURNING course_id, course_name`, [name.trim()]);
    res.status(201).json(result.rows[0]);
  });

  // Optional query parameters support API-level course and status filtering.
  app.get('/api/assignments', async (req, res) => {
    const { course_id, status } = req.query;
    if (course_id !== undefined && !validId(course_id)) return res.status(400).json({ error: 'Invalid course ID.' });
    if (status !== undefined && !statuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const values = [], clauses = [];
    if (course_id !== undefined) { values.push(Number(course_id)); clauses.push(`a.course_id = $${values.length}`); }
    if (status !== undefined) { values.push(status); clauses.push(`a.status = $${values.length}`); }
    res.json((await db.query(selectAssignment + (clauses.length ? ' WHERE ' + clauses.join(' AND ') : '') + ' ORDER BY a.due_date, a.assignment_id', values)).rows);
  });

  // ID validation is separate from authorization; both are required.
  app.param('id', (req, res, next, id) => {
    if (!validId(id)) return res.status(400).json({ error: 'Invalid assignment ID.' });
    next();
  });
  app.get('/api/assignments/:id', async (req, res) => {
    const result = await db.query(selectAssignment + ' WHERE a.assignment_id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(result.rows[0]);
  });

  // Create assignments only after validating all writable fields.
  app.post('/api/assignments', async (req, res) => {
    const error = assignmentError(req.body);
    if (error) return res.status(400).json({ error });
    const { title, due_date, status, course_id, description = '' } = req.body;
    const result = await db.query(`INSERT INTO assignments (title, due_date, status, course_id, description)
      VALUES ($1,$2,$3,$4,$5) RETURNING assignment_id`, [title.trim(), due_date, status, course_id, description.trim()]);
    res.status(201).json((await db.query(selectAssignment + ' WHERE a.assignment_id = $1', [result.rows[0].assignment_id])).rows[0]);
  });

  // Replace editable fields; the ID and database relationships stay controlled by the API.
  app.put('/api/assignments/:id', async (req, res) => {
    const error = assignmentError(req.body);
    if (error) return res.status(400).json({ error });
    const { title, due_date, status, course_id, description = '' } = req.body;
    const result = await db.query(`UPDATE assignments SET title=$1, due_date=$2, status=$3, course_id=$4, description=$5
      WHERE assignment_id=$6 RETURNING assignment_id`, [title.trim(), due_date, status, course_id, description.trim(), req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Assignment not found.' });
    res.json((await db.query(selectAssignment + ' WHERE a.assignment_id = $1', [req.params.id])).rows[0]);
  });

  // A smaller mutation supports the status dropdown and Mark complete button.
  app.patch('/api/assignments/:id/status', async (req, res) => {
    if (!statuses.includes(req.body?.status)) return res.status(400).json({ error: 'Select a valid status.' });
    const result = await db.query('UPDATE assignments SET status=$1 WHERE assignment_id=$2 RETURNING assignment_id', [req.body.status, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Assignment not found.' });
    res.json((await db.query(selectAssignment + ' WHERE a.assignment_id = $1', [req.params.id])).rows[0]);
  });

  // Return 204 only after the database confirms deletion.
  app.delete('/api/assignments/:id', async (req, res) => {
    const result = await db.query('DELETE FROM assignments WHERE assignment_id=$1 RETURNING assignment_id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Assignment not found.' });
    res.status(204).end();
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));

  // Async route/session errors reach this handler; secrets are never sent to the client.
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
    if (error.code === '23503') return res.status(400).json({ error: 'The selected course does not exist.' });
    if (error.code === '23505') return res.status(409).json({ error: 'That course already exists.' });
    console.error('API request failed:', error.code || error.name);
    res.status(500).json({ error: 'Unable to access saved data. Check that PostgreSQL is running and database setup is complete.' });
  });
  
  return app;
}
