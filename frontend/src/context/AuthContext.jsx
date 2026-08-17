import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    return !(token && savedUser);
  });

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If unauthorized and tokens cleared by interceptor
      if (!localStorage.getItem('access_token')) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [fetchUserProfile]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password. Please try again.';
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password, passwordConfirm) => {
    try {
      await api.post('/auth/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm || password,
      });

      // Auto-login after registration
      return await login(username, password);
    } catch (error) {
      let message = 'Registration failed. Please check your inputs.';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.username) message = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.email) message = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.password) message = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.password_confirm) message = Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm;
        else if (data.detail) message = data.detail;
      }
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUserProfile: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
