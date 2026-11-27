/**
 * Shares the user's sign-in status across the React app. When the page
 * loads, React asks the Express API whether the browser's session is valid.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { request } from '../api.js';

//components inside AuthProvider use this context to read current status
// and call shared actions
const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  //checking = waiting for api, authenticated = signed in
  // anonymous = signed out, error = check failed

  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(''); // error message
  const [reason, setReason] = useState(''); // why the user needs to sign in again 

  //ask express to verify session
  // useCallback keeps the same function between renders so updating the status doesnt trigger another check
  const check = useCallback(async () => {
    setStatus('checking'); setError('');

    try { await request('/auth/session'); 
      setStatus('authenticated'); 
    }
    catch (e) {
      if (e.status === 401) {
        
        setStatus('anonymous'); //express found no session, expected before sign in 
      } 
      else { 
        // if api is unreachable, sign in status still unknown
        setError(e.message); 
        setStatus('error');
      }
    }
  }, []);

  // Check when the provider first appears, including after refresh
  useEffect(() => { 
    check(); 
  }, [check]);

  //other components can call expire when they learn session has ended
  // it updates the screen and gives the user a reason to sign in again
  const expire = useCallback(() => {
    setReason('Your session ended. Sign in again to continue.');
    setStatus('anonymous');
  }, []);


  async function login(accessCode) {

    //wait for express to accept the code before showing the signed in view. 
    // if the request fails, the component that called login() recieves the error. 
    await request('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ accessCode }) 
    });

    setReason(''); 
    setStatus('authenticated');
  }

  async function logout() {
    try { 
      await request('/auth/logout', { method: 'POST', body: '{}' }); 
    }
    catch (e) { 
      //401 means session has already ended, show signed out view
      // pass other errors back to calling component
      if (e.status !== 401) throw e; 
    } 

    setReason(''); 
    setStatus('anonymous');
  }
  //components wrapped by AuthProvider
  // can access these values and functions by calling useAuth()
  return <AuthContext.Provider value={{ status, error, reason, check, login, logout, expire }}>
    {children}
    </AuthContext.Provider>;
}

//example of use, sign out button gets click handler with const {logout} = useAuth() inside button component
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
