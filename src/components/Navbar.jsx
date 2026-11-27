/**
 * Displays the CodeCrew navigation bar. Everyone can see the logo.
 * Once the session is verified, the bar also shows the coursework links
 * and the Sign out button.
 */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  // useAuth provides the current sign-in status and the shared logout function.
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    // Disable the button while signing out and clear any error from an earlier attempt.
    setBusy(true);
    setError('');

    try {
      // logout() contacts the API and updates the shared sign-in status.
      // React then updates which links appear in the navigation bar.
      await auth.logout();
    } catch (e) {
      // Show the error message if the sign-out request fails.
      setError(e.message);
    } finally {
      // The request has finished. Allow another attempt if the button is still visible.
      setBusy(false);
    }
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        {/* Clicking the logo opens the dashboard for signed-in users and the login page otherwise. */}
        <NavLink
          to={auth.status === 'authenticated' ? '/dashboard' : '/login'}
          className="navbar-brand"
        >
          <span className="navbar-logo">{'</>'}</span>
          <span>
            CodeCrew <small>Student Productivity Hub</small>
          </span>
        </NavLink>

        {auth.status === 'authenticated' && (
          <div className="navbar-links">
            {/* Build one link per page. For example, “Assignments” links to /assignments.
                NavLink supplies isActive so the current page can be highlighted. */}
            {['Dashboard', 'Assignments', 'Progress'].map(page => (
              <NavLink
                key={page}
                to={`/${page.toLowerCase()}`}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {page}
              </NavLink>
            ))}

            <button className="btn btn-secondary" disabled={busy} onClick={signOut}>
              {busy ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        )}
      </nav>

      {/* role="alert" lets screen readers announce a sign-out error when it appears. */}
      {error && <p className="error" role="alert">{error}</p>}
    </header>
  );
}