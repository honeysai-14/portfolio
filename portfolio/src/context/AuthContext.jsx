import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState({ online: false, checking: true });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  // Check API health and verify token on startup
  useEffect(() => {
    const checkState = async () => {
      // 1. Check health
      try {
        const healthRes = await fetch(`${API_BASE}/health`);
        if (healthRes.ok) {
          setApiHealth({ online: true, checking: false });
        } else {
          setApiHealth({ online: false, checking: false });
        }
      } catch (err) {
        setApiHealth({ online: false, checking: false });
      }

      // 2. Verify token if present
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              setAdmin(data.user);
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Network error while verifying token. Retaining token offline.');
          // Since the API is down, we don't forcefully log them out if we can't connect,
          // but we won't let them modify anything without an active session anyway.
        }
      }
      setLoading(false);
    };

    checkState();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setAdmin(data.admin);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    token,
    admin,
    loading,
    apiHealth,
    login,
    logout,
    API_BASE
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
