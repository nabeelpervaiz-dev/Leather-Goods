import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getCurrentAdminSession,
  loginAdmin,
  logoutAdmin,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => getCurrentAdminSession());
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const session = await loginAdmin(email, password);
      setAdminUser(session);
      return session;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await logoutAdmin();
      setAdminUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      adminUser,
      isAuthenticated: Boolean(adminUser),
      authLoading,
      login,
      logout,
    }),
    [adminUser, authLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
