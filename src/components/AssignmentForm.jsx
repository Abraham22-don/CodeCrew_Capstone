/**
 * Displays the form for adding or editing an assignment.
 * The form keeps track of the user's changes until they select Save Assignment.
 * The parent component provides the course list, saves the data, and closes the form.
 */
import { useState } from 'react';
import { statuses } from '../api.js';

export default function AssignmentForm({ item, courses, busy, save, onClose }) {
  // when editing, fill the fields with the selected assignment's values.
  // for a new assignment, select the first available course and start at “Not Started.”
  const [form, setForm] = useState(
    item
      ? {
          title: item.title,
          course_id: item.course_id,
          due_date: item.due_date,
          status: item.status,
          description: item.description,
        }
      : {
          title: '',
          course_id: courses[0]?.course_id || '',
          due_date: '',
          status: 'Not Started',
          description: '',
        }
  );
  const [error, setError] = useState('');

  // every field uses this handler
  // typing title modifies title 
  // copies the other values so the course, date, status, and description stay in the form.
  const change = event =>
    setForm(old => ({ ...old, [event.target.name]: event.target.value }));

  async function submit(event) {
    // react handles submission 
    event.preventDefault();

    // browser's required check catches empty titles
    if (!form.title.trim()) {
      setError('Enter a title that is not blank.');
      return;
    }
    setError('');

    // A dropdown returns text, so convert the course ID to a number before saving.
    // An existing assignment has an ID to update. For a new one, the ID is undefined.
    const saved = await save(
      { ...form, course_id: Number(form.course_id) },
      item?.assignment_id
    );

    // keeps the form open with the user's entries if saving fails.
    if (saved) onClose();
  }

  return (
    <section className="dashboard-form-card" aria-labelledby="form-heading">
      <h2 id="form-heading">{item ? 'Edit Assignment' : 'Add Assignment'}</h2>

      <form className="dashboard-form" onSubmit={submit}>
        {error && <p role="alert" className="error">{error}</p>}

        {/* Each field displays its value from form state and calls change when edited. */}
        <label htmlFor="title">Title</label>
        <input
          autoFocus
          id="title"
          name="title"
          value={form.title}
          onChange={change}
          maxLength={150}
          required
        />

        {/* The user sees the course name. The selected value is its database ID. */}
        <label htmlFor="course">Course</label>
        <select id="course" name="course_id" value={form.course_id} onChange={change} required>
          <option value="">Select a course</option>
          {courses.map(c => (
            <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
          ))}
        </select>

        <label htmlFor="due-date">Due date</label>
        <input
          id="due-date"
          name="due_date"
          type="date"
          min="0001-01-01"
          max="9999-12-31"
          value={form.due_date}
          onChange={change}
          required
        />

        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={form.status} onChange={change}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>

        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          value={form.description}
          onChange={change}
        />

        <div className="actions">
          {/* Save submits the form. It is disabled while saving or if no courses are available. */}
          <button className="btn" disabled={busy || !courses.length}>
            {busy ? 'Saving…' : 'Save Assignment'}
          </button>

          {/* type="button" lets Cancel close the form without triggering submit(). */}
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}