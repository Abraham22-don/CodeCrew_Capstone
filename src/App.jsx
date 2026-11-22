import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet, useOutletContext } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Workspace from './pages/Workspace.jsx';
import { request } from './api.js';
import './App.css';
import './hub.css';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';

/** This component mounts only after ProtectedRoute verifies a server session.
 * Unmounting it on logout clears all loaded coursework from React memory.
 */
function WorkspaceData() {
  const { expire } = useAuth();
  // Shared data stays consistent across all three routed pages.
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const [items, subjects] = await Promise.all([request('/assignments'), request('/courses')]);
      setAssignments(items); setCourses(subjects);
    } catch (e) { if (e.status === 401) expire(); else setLoadError(e.message); }
    finally { setLoading(false); }
  }, [expire]);
  useEffect(() => { load(); }, [load]);

  // Update local state only after the database confirms a successful write.
  async function mutate(path, method, body, apply, message) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await request(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      apply(result); setNotice(message); return true;
    } catch (e) { if (e.status === 401) expire(); else setError(e.message); return false; }
    finally { setBusy(false); }
  }
  const save = (data, id) => mutate(id ? `/assignments/${id}` : '/assignments', id ? 'PUT' : 'POST', data,
    item => setAssignments(old => id ? old.map(a => a.assignment_id === id ? item : a) : [...old, item]),
    id ? 'Assignment updated.' : 'Assignment saved.');
  const changeStatus = (item, status) => mutate(`/assignments/${item.assignment_id}/status`, 'PATCH', { status },
    updated => setAssignments(old => old.map(a => a.assignment_id === updated.assignment_id ? updated : a)), 'Status updated.');
  const remove = item => mutate(`/assignments/${item.assignment_id}`, 'DELETE', null,
    () => setAssignments(old => old.filter(a => a.assignment_id !== item.assignment_id)), 'Assignment deleted.');
  const addCourse = name => mutate('/courses', 'POST', { course_name: name },
    course => setCourses(old => [...old, course].sort((a, b) => a.course_name.localeCompare(b.course_name))), 'Course added.');
  const props = { assignments, courses, busy, save, changeStatus, remove, addCourse };
  return <>
    <div className="feedback" aria-live="polite">{notice && <p className="success">{notice}</p>}</div>
    {error && <div className="feedback" role="alert"><p className="error">{error}</p></div>}
    {loading ? <p className="loading" role="status">Loading saved coursework…</p> : loadError ?
      <section className="dashboard-page"><h1>Unable to load your workspace</h1><p role="alert">{loadError}</p><button className="btn" onClick={load}>Try again</button></section> :
      <Outlet context={props} />}
  </>;
}

/** Pass shared data/callbacks down to the existing three coursework views. */
function WorkspaceView({ mode }) {
  const props = useOutletContext();
  return <Workspace key={mode} mode={mode} {...props} />;
}

/** Public login and protected coursework routes share the same navigation/footer. */
export default function App() {
  return <BrowserRouter><AuthProvider><div className="app">
    <a className="skip-link" href="#main">Skip to content</a><Navbar />
    <main id="main"><Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceData />}>
          <Route path="/dashboard" element={<WorkspaceView mode="dashboard" />} />
          <Route path="/assignments" element={<WorkspaceView mode="assignments" />} />
          <Route path="/progress" element={<WorkspaceView mode="progress" />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<section className="dashboard-page"><h1>Page not found</h1><Link to="/dashboard">Return to Dashboard</Link></section>} />
    </Routes></main>
    <footer className="site-footer"><span>CodeCrew · Student Productivity Hub</span><span>One workspace for your coursework.</span></footer>
  </div></AuthProvider></BrowserRouter>;
}
