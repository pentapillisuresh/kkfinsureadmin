import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('adminUser');
        const storedToken = localStorage.getItem('adminToken');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Update state
        setToken(token);
        setUser(user);
        
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  }, []);

  // Change password function
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      const response = await authApi.changePassword(oldPassword, newPassword);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
    }
  }, []);

  // Computed values
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  // Context value with useMemo for optimization
  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAdmin,
    login,
    logout,
    changePassword
  }), [user, token, loading, isAdmin, login, logout, changePassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;