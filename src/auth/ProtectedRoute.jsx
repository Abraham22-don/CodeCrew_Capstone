/** UI guard for navigation. Express independently guards every data endpoint. */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'checking') return <p className="loading" role="status">Checking your session…</p>;
  if (auth.status === 'error') return <section className="dashboard-page"><h1>Cannot check your session</h1><p className="error" role="alert">{auth.error}</p><button className="btn" onClick={auth.check}>Try again</button></section>;
  if (auth.status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
