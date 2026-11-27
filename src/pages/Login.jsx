/**
 * Displays the sign-in form for the shared workspace. Express checks the
 * access code. Once sign-in succeeds, React takes the user to their coursework.
 */
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const auth = useAuth();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // ProtectedRoute passes along the page the user tried to open.
  // For example, someone who opened /progress returns there after signing in.
  // A direct visit to /login or an unrecognized path leads to /dashboard.
  const from = location.state?.from;
  const destination = ['/dashboard', '/assignments', '/progress'].includes(from)
    ? from
    : '/dashboard';

  // This handles both an existing session and a successful form submission.
  // `replace` means the browser's Back button skips this login page.
  if (auth.status === 'authenticated') {
    return <Navigate to={destination} replace />;
  }

  async function submit(event) {
    // Keep the page open, disable the form, and clear any previous sign-in error.
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      // login() sends the code to Express and updates the shared sign-in status.
      // That status change triggers the redirect above.
      await auth.login(code);
      setCode('');
    } catch (e) {
      setError(e.message);
    } finally {
      // Let the user try again if the form is still visible.
      setBusy(false);
    }
  }

  return (
    <section className="login-page">
      <div className="dashboard-form-card login-card">
        <span className="navbar-logo" aria-hidden="true">{'</>'}</span>
        <span className="dashboard-eyebrow">CODECREW / STUDENT WORKSPACE</span>
        <h1>Welcome back.</h1>
        <p>Enter your workspace access code to view your coursework.</p>

        {/* If the previous session ended, explain why the user needs to sign in again. */}
        {auth.reason && <p role="status">{auth.reason}</p>}

        {/* Check for an existing session before asking the user to enter the code. */}
        {auth.status === 'checking' ? (
          <p role="status">Checking your session…</p>
        ) : (
          <form className="dashboard-form" onSubmit={submit}>
            {/* `error` comes from submitting this form. `auth.error` comes from checking the session. */}
            {error && <p role="alert" className="error">{error}</p>}
            {auth.status === 'error' && <p role="alert" className="error">{auth.error}</p>}

            <label htmlFor="access-code">Workspace access code</label>
            <input
              id="access-code"
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={256}
              required
              disabled={busy}
            />

            {/* Disable the button while waiting so a second click cannot submit the form again. */}
            <button className="btn" disabled={busy}>
              {busy ? 'Signing in…' : 'Open workspace →'}
            </button>
          </form>
        )}

        <p className="login-note">One shared workspace. No individual account required.</p>
      </div>
    </section>
  );
}