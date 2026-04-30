'use client';

import { useEffect, useState } from 'react';
import { getUser, AUTH_EVENT, logout as doLogout } from './auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);

    function refresh() {
      setUser(getUser());
    }

    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener('storage', refresh); // sync entre pestañas
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    ready,
    logout: () => doLogout(),
  };
}
