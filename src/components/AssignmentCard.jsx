import { formatDate, statuses, today } from '../api.js';
export default function AssignmentCard({ item, busy, onEdit, changeStatus, remove }) {
  const overdue = item.status !== 'Completed' && item.due_date < today();
  const color = item.status === 'Completed' ? 'green' : item.status === 'In Progress' ? 'blue' : 'purple';
  return <article className="dashboard-project-card">
    <div className="project-card-top"><div className={`project-symbol ${color}`} aria-hidden="true">{item.status === 'Completed' ? '✓' : item.status === 'In Progress' ? '◷' : '▦'}</div><span className={`project-status ${item.status === 'Completed' ? 'status-completed' : 'status-progress'}`}><span className="project-status-dot" aria-hidden="true" />{item.status}</span></div>
    <span className="project-category">{item.course_name}</span>
    <h3>{item.title}</h3><p className={overdue ? 'overdue' : 'due-date'}>{overdue ? 'Overdue · ' : 'Due ' }<time dateTime={item.due_date}>{formatDate(item.due_date)}</time></p>
    <details><summary>View details</summary><p className="description">{item.description || 'No description added.'}</p></details>
    <label className="status-label" htmlFor={`status-${item.assignment_id}`}>Update status</label>
    <select id={`status-${item.assignment_id}`} value={item.status} disabled={busy} onChange={e => changeStatus(item, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
    <div className="actions card-actions">
      {item.status !== 'Completed' && <button className="btn" disabled={busy} onClick={() => changeStatus(item, 'Completed')}>Mark complete</button>}
      <button className="btn btn-secondary" disabled={busy} onClick={() => onEdit(item)}>Edit</button>
      <button className="btn danger" disabled={busy} onClick={() => { if (window.confirm(`Delete “${item.title}”? This cannot be undone.`)) remove(item); }}>Delete</button>
    </div>
    <div className="project-card-footer"><span>{item.status === 'Completed' ? 'All finished!' : 'Keep up the progress'}</span><span className="project-arrow" aria-hidden="true">↗</span></div>
  </article>;
}
