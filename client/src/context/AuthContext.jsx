import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('imovies_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Failed to verify existing session:', err.message);
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('imovies_token', data.token);
      localStorage.setItem('imovies_user', JSON.stringify(data.user));
      return data;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('imovies_token', data.token);
      localStorage.setItem('imovies_user', JSON.stringify(data.user));
      return data;
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user && user.role === 'admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
