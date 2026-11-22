import { useState } from 'react';
import { statuses } from '../api.js';
export default function AssignmentForm({ item, courses, busy, save, onClose }) {
  const [form, setForm] = useState(item ? { title: item.title, course_id: item.course_id, due_date: item.due_date, status: item.status, description: item.description } :
    { title: '', course_id: courses[0]?.course_id || '', due_date: '', status: 'Not Started', description: '' });
  const [error, setError] = useState('');
  const change = event => setForm(old => ({ ...old, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) { setError('Enter a title that is not blank.'); return; }
    setError('');
    if (await save({ ...form, course_id: Number(form.course_id) }, item?.assignment_id)) onClose();
  }
  return <section className="dashboard-form-card" aria-labelledby="form-heading">
    <h2 id="form-heading">{item ? 'Edit Assignment' : 'Add Assignment'}</h2>
    <form className="dashboard-form" onSubmit={submit}>
      {error && <p role="alert" className="error">{error}</p>}
      <label htmlFor="title">Title</label><input autoFocus id="title" name="title" value={form.title} onChange={change} maxLength={150} required />
      <label htmlFor="course">Course</label><select id="course" name="course_id" value={form.course_id} onChange={change} required><option value="">Select a course</option>{courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}</select>
      <label htmlFor="due-date">Due date</label><input id="due-date" name="due_date" type="date" min="0001-01-01" max="9999-12-31" value={form.due_date} onChange={change} required />
      <label htmlFor="status">Status</label><select id="status" name="status" value={form.status} onChange={change}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
      <label htmlFor="description">Description (optional)</label><textarea id="description" name="description" rows={3} maxLength={2000} value={form.description} onChange={change} />
      <div className="actions"><button className="btn" disabled={busy || !courses.length}>{busy ? 'Saving…' : 'Save Assignment'}</button><button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>Cancel</button></div>
    </form>
  </section>;
}
