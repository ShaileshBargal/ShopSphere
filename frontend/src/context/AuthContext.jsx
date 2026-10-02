import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('shopsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shopsphere_user');
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      setUser(data);
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  // Register
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/auth/register', userData);
      setUser(data);
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.put('/auth/profile', profileData);
      setUser(data);
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopsphere_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
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
