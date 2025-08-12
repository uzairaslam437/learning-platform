import { useState,useEffect } from "react";
import type { User } from "../types/Auth";
import type { ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = window.localStorage?.getItem('token');
    const userData = window.localStorage?.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.localStorage?.removeItem('token');
        window.localStorage?.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'instructor') => {
    try {
      setLoading(true);
      
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:3000/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      if (window.localStorage) {
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('user', JSON.stringify(data.user));
      }
      setUser(data.user);
    } catch (error) {
    //   // For demo purposes, simulate successful login
    //   const mockUser: User = {
    //     id: '1',
    //     email: email,
    //     firstName: email.split('@')[0],
    //     role: role,
    //   };
      
    //   if (window.localStorage) {
    //     window.localStorage.setItem('token', 'mock-token-' + Date.now());
    //     window.localStorage.setItem('user', JSON.stringify(mockUser));
    //   }
    //   setUser(mockUser);
    //   throw error; // Uncomment this when using real API
        throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string,lastName: string, role: 'student' | 'instructor') => {
    try {
      setLoading(true);
      
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:3000/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName,lastName,role}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token and user data
      if (window.localStorage) {
        window.localStorage.setItem('token', data.token);
        window.localStorage.setItem('user', JSON.stringify(data.user));
      }
      setUser(data.user);
    } catch (error) {
      // For demo purposes, simulate successful registration
    //   const mockUser: User = {
    //     id: '1',
    //     email: email,
    //     name: name,
    //     role: role,
    //   };
      
    //   if (window.localStorage) {
    //     window.localStorage.setItem('token', 'mock-token-' + Date.now());
    //     window.localStorage.setItem('user', JSON.stringify(mockUser));
    //   }
    //   setUser(mockUser);
      throw new error; // Uncomment this when using real API
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (window.localStorage) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};