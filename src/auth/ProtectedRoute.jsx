/** controls what user sees when opening protected page like dashboard.
 * express checks session before returning workspace data
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  // load message while express checks session
  if (auth.status === 'checking') {
    return <p className="loading" role="status">Checking your session…</p>;
  }
  
  //if check fails, show the error, try again runs session check again without reload
  if (auth.status === 'error') {
    return (
    <section className="dashboard-page">
      <h1>Cannot check your session</h1>
      <p className="error" role="alert">{auth.error}</p>
      <button className="btn" onClick={auth.check}>Try again</button>
    </section>
    );
  }

  //send signed out users to login page, pass along requested path
  // ex. /dashboard
  // so login page can send them back after sign in
  //replace swaps current browser history for login page
  if (auth.status !== 'authenticated') {
    
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  
  }
  
  return <Outlet />;
}
