/**
 * Connects the app's URLs to its React pages. Dashboard, Assignments, and
 * Progress share one set of coursework data, so a change made on one page
 * is available when the user switches to another.
 */ 
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

/**
 * Loads coursework after ProtectedRoute confirms the user's session.
 * When the user signs out, React removes this component and its local copy
 * of the coursework. The saved assignments and courses stay in PostgreSQL.
 */
function WorkspaceData() {
  const { expire } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  // These values control what appears while fetching the workspace or if loading fails.
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // These values track changes the user makes after loading, such as saving
  // an assignment. The page uses busy to disable buttons during a request.
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // useCallback keeps the same load function between renders while expire
  // stays the same. This lets the effect below depend on load safely.
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      // Start both requests together. Promise.all returns the results in the
      // order listed, so items holds assignments and subjects holds courses.
      const [items, subjects] = await Promise.all([
        request('/assignments'),
        request('/courses'),
      ]);

      setAssignments(items);
      setCourses(subjects);
    } catch (e) {
      // A 401 means the API requires sign-in again. For other errors, show
      // the message and let the user retry from this page.
      if (e.status === 401) expire();
      else setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, [expire]);

  // Fetch the coursework when the protected workspace first opens.
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Send a change to the API. Each action below supplies an `apply` function
   * that tells React how to update its list after the request succeeds.
   * Return true or false so a form knows whether its save succeeded.
   */
  async function mutate(path, method, body, apply, message) {
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const result = await request(path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      apply(result);
      setNotice(message);
      return true;
    } catch (e) {
      if (e.status === 401) expire();
      else setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  // The form supplies an ID when editing. Replace the matching assignment
  // with the saved version. For a new assignment, append the item the API returns.
  const save = (data, id) => mutate(
    id ? `/assignments/${id}` : '/assignments',
    id ? 'PUT' : 'POST',
    data,
    item => setAssignments(old =>
      id ? old.map(a => a.assignment_id === id ? item : a) : [...old, item]
    ),
    id ? 'Assignment updated.' : 'Assignment saved.'
  );

  // Both the status dropdown and the “Mark complete” button use this action.
  const changeStatus = (item, status) => mutate(
    `/assignments/${item.assignment_id}/status`,
    'PATCH',
    { status },
    updated => setAssignments(old =>
      old.map(a => a.assignment_id === updated.assignment_id ? updated : a)
    ),
    'Status updated.'
  );

  // After the API confirms deletion, keep only assignments with a different ID.
  const remove = item => mutate(
    `/assignments/${item.assignment_id}`,
    'DELETE',
    null,
    () => setAssignments(old => old.filter(a => a.assignment_id !== item.assignment_id)),
    'Assignment deleted.'
  );

  // Add the saved course to a new list and sort it alphabetically for the dropdowns.
  const addCourse = name => mutate(
    '/courses',
    'POST',
    { course_name: name },
    course => setCourses(old =>
      [...old, course].sort((a, b) => a.course_name.localeCompare(b.course_name))
    ),
    'Course added.'
  );

  // Outlet displays the page that matches the URL. Its context gives that
  // page access to these lists and actions once loading succeeds.
  const props = { assignments, courses, busy, save, changeStatus, remove, addCourse };

  return (
    <>
      <div className="feedback" aria-live="polite">
        {notice && <p className="success">{notice}</p>}
      </div>

      {error && (
        <div className="feedback" role="alert">
          <p className="error">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="loading" role="status">Loading saved coursework…</p>
      ) : loadError ? (
        <section className="dashboard-page">
          <h1>Unable to load your workspace</h1>
          <p role="alert">{loadError}</p>
          <button className="btn" onClick={load}>Try again</button>
        </section>
      ) : (
        <Outlet context={props} />
      )}
    </>
  );
}

/**
 * Give Workspace the shared data and the mode selected by the current URL.
 * Using mode as the key resets page-specific state, such as an open form or
 * search filter, when switching pages. The lists in WorkspaceData stay loaded.
 */
function WorkspaceView({ mode }) {
  const props = useOutletContext();
  return <Workspace key={mode} mode={mode} {...props} />;
}

/** Set up navigation, shared sign-in state, and the routes for each page. */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          {/* Keyboard users can skip the navigation and jump to the main content. */}
          <a className="skip-link" href="#main">Skip to content</a>
          <Navbar />

          <main id="main">
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* For all three coursework URLs, check the session first, load
                  the shared data next, then display the requested view. */}
              <Route element={<ProtectedRoute />}>
                <Route element={<WorkspaceData />}>
                  <Route path="/dashboard" element={<WorkspaceView mode="dashboard" />} />
                  <Route path="/assignments" element={<WorkspaceView mode="assignments" />} />
                  <Route path="/progress" element={<WorkspaceView mode="progress" />} />
                </Route>
              </Route>

              {/* The home URL leads to the dashboard, which runs the same session check. */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* The wildcard matches any URL that doesn't have a page above. */}
              <Route
                path="*"
                element={
                  <section className="dashboard-page">
                    <h1>Page not found</h1>
                    <Link to="/dashboard">Return to Dashboard</Link>
                  </section>
                }
              />
            </Routes>
          </main>

          <footer className="site-footer">
            <span>CodeCrew · Student Productivity Hub</span>
            <span>One workspace for your coursework.</span>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}