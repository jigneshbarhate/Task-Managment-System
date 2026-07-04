import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on page refresh
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await API.get('/auth/me');
        if (res.data && res.data.data.user) {
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      } catch (err) {
        // Token was invalid / expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { user: userData } = res.data.data;
      const { token } = res.data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed! Please check credentials';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      const { user: userData } = res.data.data;
      const { token } = res.data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      toast.success('Account registered successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failure', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (name, avatar) => {
    try {
      const res = await API.put('/auth/profile', { name, avatar });
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await API.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword
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
