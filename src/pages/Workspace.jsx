import { useState } from 'react';
import { Link } from 'react-router-dom';
import AssignmentForm from '../components/AssignmentForm.jsx';
import AssignmentCard from '../components/AssignmentCard.jsx';
import { statuses, today } from '../api.js';
export default function Workspace({ mode, assignments, courses, busy, save, changeStatus, remove, addCourse }) {
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseError, setCourseError] = useState('');
  const completed = assignments.filter(a => a.status === 'Completed').length;
  const active = assignments.filter(a => a.status === 'In Progress').length;
  const overdue = assignments.filter(a => a.status !== 'Completed' && a.due_date < today()).length;
  const percent = assignments.length ? Math.round(completed / assignments.length * 100) : 0;
  const filtered = assignments.filter(a => (!course || String(a.course_id) === course) && (!status || a.status === status) &&
    `${a.title} ${a.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.due_date.localeCompare(b.due_date) || a.assignment_id - b.assignment_id);
  const upcoming = filtered.filter(a => a.status !== 'Completed' && a.due_date >= today());
  const late = filtered.filter(a => a.status !== 'Completed' && a.due_date < today());
  const title = { dashboard: 'Your Dashboard', assignments: 'Your Assignments', progress: 'Your Progress' }[mode];
  const openEdit = item => { setEditing(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cards = list => <div className="dashboard-project-grid">{list.map(item => <AssignmentCard key={item.assignment_id} {...{ item, busy, changeStatus, remove }} onEdit={openEdit} />)}</div>;
  async function createCourse(event) {
    event.preventDefault();
    if (!courseName.trim()) { setCourseError('Enter a course name that is not blank.'); return; }
    setCourseError('');
    if (await addCourse(courseName.trim())) setCourseName('');
  }
  return <div className="dashboard-page">
    <header className="dashboard-header"><div><span className="dashboard-eyebrow">STUDENT WORKSPACE / {mode.toUpperCase()}</span><h1>{title}<span>.</span></h1><p>Keep coursework, deadlines, and progress together.</p></div>
      <button className="dashboard-create-btn" disabled={busy || !courses.length} onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Assignment</button></header>
    {/* Restore the original colored statistic icons with live assignment counts. */}
    <section className="dashboard-stats hub-stats" aria-label="All coursework totals">
      {[
        ['Total Assignments', assignments.length, '▦', 'purple', 'Across all courses'],
        ['In Progress', active, '◷', 'blue', 'Assignments currently active'],
        ['Completed', completed, '✓', 'green', 'Assignments finished'],
        ['Overdue', overdue, '!', 'rose', 'Unfinished past deadlines'],
      ].map(([label, count, icon, color, note]) => (
        <article className="stat-card" key={label}>
          <div className="stat-card-top"><span>{label}</span><span className={`stat-icon stat-${color}`} aria-hidden="true">{icon}</span></div>
          <h2>{count}</h2><p>{note}</p>
        </article>
      ))}
    </section>
    {/* Completion is derived from saved assignments, not an invented partial-work percentage. */}
    {mode === 'dashboard' && <section className="dashboard-form-card completion-panel" aria-labelledby="completion-heading">
      <div className="completion-heading"><div><span className="dashboard-eyebrow">YOUR MOMENTUM</span><h2 id="completion-heading">Coursework completion</h2></div><strong className="completion-number">{percent}%</strong></div>
      <div className="project-progress-track" role="progressbar" aria-label="Overall coursework completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="project-progress-fill purple" style={{ width: `${percent}%` }} />
      </div>
      <p>{completed} of {assignments.length} assignments completed across all courses.</p>
      <div className="course-progress">{courses.map(c => {
        const items = assignments.filter(a => a.course_id === c.course_id);
        const done = items.filter(a => a.status === 'Completed').length;
        const value = items.length ? Math.round(done / items.length * 100) : 0;
        const color = ['purple', 'blue', 'green'][(c.course_id - 1) % 3];
        return <article key={c.course_id}><h3>{c.course_name}</h3><div className="project-progress-heading"><span>{done} / {items.length} completed</span><strong>{value}%</strong></div>
          <div className="project-progress-track" role="progressbar" aria-label={`${c.course_name} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className={`project-progress-fill ${color}`} style={{ width: `${value}%` }} /></div>
        </article>;
      })}</div>
    </section>}
    {!courses.length && <div className="dashboard-form-card"><h2>Add your first course</h2><p>Create a course below before adding assignments.</p>{mode !== 'assignments' && <Link className="btn" to="/assignments">Set up courses →</Link>}</div>}
    {mode === 'assignments' && <section className="dashboard-form-card"><h2>Courses</h2><p>Add the courses your assignments belong to.</p><form className="course-form" onSubmit={createCourse}><label htmlFor="course-name">Course name</label><input id="course-name" value={courseName} onChange={e => setCourseName(e.target.value)} maxLength={100} placeholder="e.g. Operating Systems" required /><button className="btn" disabled={busy}>Add Course</button></form>{courseError && <p role="alert" className="error">{courseError}</p>}<ul className="course-tags">{courses.map(c => <li key={c.course_id}>{c.course_name}</li>)}</ul></section>}
    {showForm && <AssignmentForm key={editing?.assignment_id || 'new'} item={editing} {...{ courses, busy, save }} onClose={() => { setShowForm(false); setEditing(null); }} />}
    {mode === 'progress' && <section className="dashboard-form-card"><h2>Overall completion · {percent}%</h2><p>{completed} of {assignments.length} assignments completed. Totals include all courses.</p><progress max="100" value={percent} aria-label="Overall assignment completion" />
      <div className="course-progress">{courses.map(c => {
        const items = assignments.filter(a => a.course_id === c.course_id);
        const done = items.filter(a => a.status === 'Completed').length;
        return <article key={c.course_id}><h3>{c.course_name}</h3><p>{done} / {items.length} completed</p><progress max={items.length || 1} value={done} aria-label={`${c.course_name} completion`} /></article>;
      })}</div></section>}
    <section aria-labelledby="work-heading"><div className="dashboard-section-heading"><div><h2 id="work-heading">{mode === 'dashboard' ? 'Deadlines to watch' : mode === 'progress' ? 'Review coursework' : 'Assignment list'}</h2><p>{mode === 'dashboard' ? 'Unfinished work, ordered by due date.' : 'Filter your work and open a card for details.'}</p></div></div>
      <div className="filters"><div><label htmlFor="search">Search assignments</label><input id="search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or description" /></div><div><label htmlFor="course-filter">Course</label><select id="course-filter" value={course} onChange={e => setCourse(e.target.value)}><option value="">All courses</option>{courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}</select></div><div><label htmlFor="status-filter">Status</label><select id="status-filter" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div></div>
      {mode === 'dashboard' ? <>{late.length > 0 && <><h3 className="overdue">Overdue</h3>{cards(late)}</>}<h3>Upcoming deadlines</h3>{upcoming.length ? cards(upcoming) : <p className="dashboard-empty">No upcoming unfinished assignments match your filters.</p>}<p><Link className="dashboard-back-link" to="/assignments">View all assignments, including completed work →</Link></p></> : filtered.length ? cards(filtered) : <div className="dashboard-empty"><h3>{assignments.length ? 'No matching assignments' : 'No assignments yet'}</h3><p>{assignments.length ? 'Try another search, course, or status.' : 'Add a course, then create your first assignment.'}</p></div>}
    </section>
    {mode === 'dashboard' && <section className="dashboard-banner">
      <div className="banner-icon" aria-hidden="true">✦</div>
      <div><h3>Great things happen when we work together.</h3><p>Keep learning, collaborating, and making progress.</p></div>
      <Link to="/progress" className="banner-link">View your progress →</Link>
    </section>}
  </div>;
}
