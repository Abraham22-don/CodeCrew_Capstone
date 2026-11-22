/** Small access-code form; the server checks the code and issues the session cookie. */
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
export default function Login() {
  const auth = useAuth();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Only allow known internal destinations; never redirect to a supplied external URL.
  const from = location.state?.from;
  const destination = ['/dashboard', '/assignments', '/progress'].includes(from) ? from : '/dashboard';
  if (auth.status === 'authenticated') return <Navigate to={destination} replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await auth.login(code); setCode(''); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <section className="login-page"><div className="dashboard-form-card login-card">
    <span className="navbar-logo" aria-hidden="true">{'</>'}</span>
    <span className="dashboard-eyebrow">CODECREW / STUDENT WORKSPACE</span>
    <h1>Welcome back.</h1><p>Enter your workspace access code to view your coursework.</p>
    {auth.reason && <p role="status">{auth.reason}</p>}
    {auth.status === 'checking' ? <p role="status">Checking your session…</p> : <form className="dashboard-form" onSubmit={submit}>
      {error && <p role="alert" className="error">{error}</p>}
      {auth.status === 'error' && <p role="alert" className="error">{auth.error}</p>}
      <label htmlFor="access-code">Workspace access code</label>
      <input id="access-code" type="password" autoComplete="current-password" value={code} onChange={e => setCode(e.target.value)} maxLength={256} required disabled={busy} />
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Open workspace →'}</button>
    </form>}
    <p className="login-note">One shared workspace. No individual account required.</p>
  </div></section>;
}
