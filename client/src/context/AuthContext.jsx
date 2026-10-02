import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eventhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eventhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify auth on initial load or token changes
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('eventhub_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('eventhub_user', JSON.stringify(data.user));
        } else {
          logout(false);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);
      if (data.success) {
        localStorage.setItem('eventhub_token', data.token);
        localStorage.setItem('eventhub_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message || 'Registration successful!');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('eventhub_token', data.token);
        localStorage.setItem('eventhub_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data } = await API.post('/auth/admin/login', { email, password });
      if (data.success) {
        localStorage.setItem('eventhub_token', data.token);
        localStorage.setItem('eventhub_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome Admin, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid admin credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await API.put('/auth/profile', formData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('eventhub_user', JSON.stringify(data.user));
        toast.success(data.message || 'Profile updated successfully!');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_user');
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        register,
        login,
        adminLogin,
        updateProfile,
        logout,
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
