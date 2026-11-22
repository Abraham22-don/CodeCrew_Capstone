/** Shared authentication state, verified by Express rather than a browser flag. */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { request } from '../api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const check = useCallback(async () => {
    setStatus('checking'); setError('');
    try { await request('/auth/session'); setStatus('authenticated'); }
    catch (e) {
      if (e.status === 401) setStatus('anonymous');
      else { setError(e.message); setStatus('error'); }
    }
  }, []);
  // Initial refresh waits for session verification before showing protected data.
  useEffect(() => { check(); }, [check]);
  const expire = useCallback(() => {
    setReason('Your session ended. Sign in again to continue.');
    setStatus('anonymous');
  }, []);
  async function login(accessCode) {
    await request('/auth/login', { method: 'POST', body: JSON.stringify({ accessCode }) });
    setReason(''); setStatus('authenticated');
  }
  async function logout() {
    try { await request('/auth/logout', { method: 'POST', body: '{}' }); }
    catch (e) { if (e.status !== 401) throw e; } // Already expired is effectively signed out.
    setReason(''); setStatus('anonymous');
  }
  return <AuthContext.Provider value={{ status, error, reason, check, login, logout, expire }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
