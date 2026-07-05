import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('snackhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Set default auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('snackhub_token', token);
      fetchUser();
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('snackhub_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token is invalid/expired, silent logout
        logout();
      } else {
        console.error("Error fetching user data", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    setToken(response.data.accessToken || response.data.token); // Adjust based on JwtResponse structure
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('snackhub_cart');
    window.dispatchEvent(new Event('auth_logout'));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
