/** Shared navigation. Show coursework links and sign-out only for a verified session. */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    setBusy(true); setError('');
    try { await auth.logout(); }
    catch (e) { setError(e.message); } // Do not claim sign-out succeeded if the server was unreachable.
    finally { setBusy(false); }
  }
  
  return <header className="site-header"><nav className="navbar" aria-label="Main navigation">
    <NavLink to={auth.status === 'authenticated' ? '/dashboard' : '/login'} className="navbar-brand"><span className="navbar-logo">{'</>'}</span><span>CodeCrew <small>Student Productivity Hub</small></span></NavLink>
    {auth.status === 'authenticated' && <div className="navbar-links">{['Dashboard', 'Assignments', 'Progress'].map(page =>
      <NavLink key={page} to={`/${page.toLowerCase()}`} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{page}</NavLink>)}
      <button className="btn btn-secondary" disabled={busy} onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</button>
    </div>}
  </nav>{error && <p className="error" role="alert">{error}</p>}</header>;
}
