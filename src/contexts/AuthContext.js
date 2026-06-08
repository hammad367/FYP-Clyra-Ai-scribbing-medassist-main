'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create authentication context for global state management
const AuthContext = createContext({});

// AuthProvider wraps the entire app to provide authentication state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // Currently logged-in doctor
  const [loading, setLoading] = useState(true); // Loading state during auth check
  const router = useRouter();

  // Check authentication status when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  // Verify if user is already logged in (checks JWT token validity)
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.doctor);  // User is authenticated
        return data.doctor;
      } else {
        setUser(null);  // User needs to login
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);  // Auth check complete
    }
  };

  const refreshUser = async () => {
    return await checkAuth();
  };

  const updateUser = (updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Handle user login
  const signin = async (email, password) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    setUser(data.doctor);        // Store authenticated user
    router.push('/dashboard');   // Redirect to dashboard
    return data;
  };

  // Handle user registration
  const signup = async (name, email, password, specialization) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, specialization }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign up');
    }

    setUser(data.doctor);        // Auto-login after successful signup
    router.push('/dashboard');   // Redirect to dashboard
    return data;
  };

  // Handle user logout
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });  // Clear server-side session
    setUser(null);           // Clear user from state
    router.push('/signin');  // Redirect to login page
  };

  // Provide auth state and methods to all child components
  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to auth context in components
export const useAuth = () => useContext(AuthContext);
