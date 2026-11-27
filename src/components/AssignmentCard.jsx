/**
 * Displays one assignment on the dashboard. The parent component passes
 * in the assignment as `item` and provides the functions that handle
 * editing, status changes, and deletion.
 */


import { formatDate, statuses, today } from '../api.js';



export default function AssignmentCard({ item, busy, onEdit, changeStatus, remove }) {

//both dates use yyyy-mm-dd, comparing strings puts them in data order
//unfinished assignments because overdue the aday after the due date
  const overdue = item.status !== 'Completed' && item.due_date < today();

  //status colors, green, blue, and purple
  const color = item.status === 'Completed' ? 'green' : item.status === 'In Progress' ? 'blue' : 'purple';
  
  return (
    <article className="dashboard-project-card">
      {/*status is written out, screen readers can skip decorative icon and dot */}

    <div className="project-card-top">
      <div className={`project-symbol ${color}`} aria-hidden="true">
        {item.status === 'Completed' ? '✓' : item.status === 'In Progress' ? '◷' : '▦'}
        </div>
        <span className={`project-status ${item.status === 'Completed' ? 'status-completed' : 'status-progress'}`}>
          <span className="project-status-dot" aria-hidden="true" />
          {item.status}
          </span>
        </div>

    <span className="project-category">{item.course_name}</span>
    <h3>{item.title}</h3>
    
    
    {/* Show a readable date on the card and keep the original date in the HTML. */}
    <p className={overdue ? 'overdue' : 'due-date'}>
      {overdue ? 'Overdue · ' : 'Due ' }
      <time dateTime={item.due_date}>{formatDate(item.due_date)}</time>
      </p>

    {/* Clicking “View details” opens or closes the description using built-in HTML behavior. */}
    <details>
      <summary>View details</summary>
      <p className="description">{item.description || 'No description added.'}</p>
    </details>

    {/* Each assignment ID links this label to the dropdown on this particular card. */}
    <label className="status-label" htmlFor={`status-${item.assignment_id}`}>
      Update status
    </label>
    <select 
    id={`status-${item.assignment_id}`} 
    value={item.status} 
    disabled={busy} 
    onChange={e => changeStatus(item, e.target.value)}
    >
      {/* Build one option for each status in the shared list. */}
      {statuses.map(s => <option key={s}>{s}</option>)}
    </select>


 {/* While busy is true, the dropdown and buttons are disabled to prevent repeat actions. */}
    <div className="actions card-actions">
      {/* Unfinished assignments get a shortcut that marks them complete in one click. */}
      {item.status !== 'Completed' && (
        <button className="btn" disabled={busy} onClick={() => changeStatus(item, 'Completed')}>
          Mark complete
          </button>
        )}

      <button className="btn btn-secondary" disabled={busy} onClick={() => onEdit(item)}>
        Edit
      </button>

    {/* Only call remove() if the user confirms which assignment to delete. */}
        <button
          className="btn danger"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`Delete “${item.title}”? This cannot be undone.`)) {
              remove(item);
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="project-card-footer">
        <span>{item.status === 'Completed' ? 'All finished!' : 'Keep up the progress'}</span>
        <span className="project-arrow" aria-hidden="true">↗</span>
      </div>
    </article>
  );
}
