import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token and get user info
      axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.role === 'admin') {
          setUser(response.data);
        } else {
          localStorage.removeItem('adminToken');
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      if (response.data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      localStorage.setItem('adminToken', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};