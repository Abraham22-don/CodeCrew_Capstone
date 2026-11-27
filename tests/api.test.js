import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { createApp } from '../server/app.js';
import { validDate } from '../server/validation.js';

// PGlite runs the PostgreSQL engine locally for repeatable tests without credentials.
// These tests do not prove a connection to the user's local or hosted server.
test('assignment API, validation, relational constraints, and disk persistence', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'hub-test-'));
  let engine = new PGlite(directory), server;
  const db = { query: async (sql, values) => {
    const result = await engine.query(sql, values);
    return { ...result, rowCount: Math.max(result.affectedRows || 0, result.rows.length) };
  } };
  try {
    const schema = await readFile(new URL('../server/schema.sql', import.meta.url), 'utf8');
    await engine.exec(schema);
    // Setup must be safe to rerun without removing data.
    await engine.exec(schema);
    server = createApp(db).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const call = async (url, method = 'GET', body) => {
      const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, body: response.status === 204 ? null : await response.json() };
    };
    assert.equal((await call('/health')).status, 200);
    assert.deepEqual((await call('/assignments')).body, []);
    assert.equal((await call('/courses', 'POST', { course_name: '  ' })).status, 400);
    const course = await call('/courses', 'POST', { course_name: 'Operating Systems' });
    assert.equal(course.status, 201);
    assert.equal((await call('/courses', 'POST', { course_name: 'Operating Systems' })).status, 409);
    const input = { title: 'Review paging', due_date: '2026-12-10', course_id: course.body.course_id, status: 'Not Started', description: 'Study FIFO and LRU.' };
    for (const invalid of [{ title: ' ' }, { due_date: '2026-02-30' }, { status: 'Unknown' }, { course_id: -1 }, { description: 123 }, { title: 'x'.repeat(151) }]) {
      assert.equal((await call('/assignments', 'POST', { ...input, ...invalid })).status, 400);
    }
    assert.equal((await call('/assignments', 'POST', { ...input, course_id: 99999 })).status, 400);
    const created = await call('/assignments', 'POST', input);
    assert.equal(created.status, 201);
    const id = created.body.assignment_id;
    assert.equal(created.body.due_date, input.due_date);
    assert.equal((await call(`/assignments/${id}`)).body.course_name, 'Operating Systems');
    const updated = await call(`/assignments/${id}`, 'PUT', { ...input, title: "Review 'paging'", status: 'In Progress' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, "Review 'paging'");
    assert.equal((await call('/assignments?status=In%20Progress')).body.length, 1);
    assert.equal((await call('/assignments?status=Completed')).body.length, 0);
    assert.equal((await call(`/assignments?course_id=${course.body.course_id}`)).body.length, 1);
    assert.equal((await call('/assignments?status=bad')).status, 400);
    assert.equal((await call(`/assignments/${id}/status`, 'PATCH', { status: 'Completed' })).body.status, 'Completed');
    assert.equal((await call('/assignments/nope')).status, 400);
    assert.equal((await call('/assignments/99999')).status, 404);
    assert.equal((await call('/assignments/99999', 'PUT', input)).status, 404);
    assert.equal((await call('/assignments/99999/status', 'PATCH', { status: 'Completed' })).status, 404);
    // Close and reopen the on-disk database, then read through the API again.
    await engine.close(); engine = new PGlite(directory);
    assert.equal((await call(`/assignments/${id}`)).body.status, 'Completed');
    assert.equal((await call(`/assignments/${id}`, 'DELETE')).status, 204);
    assert.equal((await call(`/assignments/${id}`, 'DELETE')).status, 404);
    assert.deepEqual((await call('/assignments')).body, []);
    assert.equal((await call('/missing')).status, 404);
    const malformed = await fetch(base + '/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await engine.close(); await rm(directory, { recursive: true, force: true });
  }
});
test('calendar validation handles leap days and rejects rollover dates', () => {
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2026-04-31'), false);
  assert.equal(validDate('0000-01-01'), false);
});
test('database failures return a clear error without secrets', async () => {
  const server = createApp({ query: async () => { throw new Error('secret connection string'); } }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/assignments`);
    assert.equal(response.status, 500);
    assert.equal(JSON.stringify(await response.json()).includes('secret'), false);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
