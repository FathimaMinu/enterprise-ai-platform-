import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, profileAPI, getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('eai_token'));
  const [loading, setLoading] = useState(true);

  // ── On mount: validate stored token by fetching profile ─────────────────────
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('eai_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await profileAPI.get();
        setUser(data);
        setToken(storedToken);
      } catch {
        // Token invalid / expired — clear it
        localStorage.removeItem('eai_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);

  // ── Login: call backend, store token only (not user object) ─────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    // data: { token, userId, name, role }
    localStorage.setItem('eai_token', data.token);
    setToken(data.token);
    // Fetch full profile after login
    const profile = await profileAPI.get();
    setUser(profile.data);
    return profile.data;
  }, []);

  // ── Register: create account then auto-login ─────────────────────────────────
  const register = useCallback(async (name, email, password, company) => {
    const { data } = await authAPI.register({ name, email, password, department: company });
    localStorage.setItem('eai_token', data.token);
    setToken(data.token);
    const profile = await profileAPI.get();
    setUser(profile.data);
    return profile.data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('eai_token');
    setToken(null);
    setUser(null);
  }, []);

  // ── Update profile locally (after a successful PUT /api/profile) ─────────────
  const updateProfile = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
