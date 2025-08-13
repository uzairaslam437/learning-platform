import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/Auth";
import { authAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    const verifyAndSetup = async () => {
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setAccessToken(token);
          setUser(parsedUser);

          // Set token refresh interval
          const interval = setInterval(refreshAccessToken, 14 * 60 * 1000);
          
          // Store interval ID for cleanup
          return () => clearInterval(interval);
        } catch (error) {
          console.error("Error parsing user data:", error);
          logout();
        }
      }

      setLoading(false);
    };

    verifyAndSetup();
  }, []); // Empty dependency array to run only once

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // This will run when component unmounts
      setLoading(false);
      setUser(null);
      setAccessToken(null);
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: "student" | "instructor"
  ) => {
    try {
      const data = await authAPI.login(email, password, role);
      
      console.log("AuthProvider login response:", data);

      // Only proceed if login was successful
      if (data.success && data.accessToken && data.user) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAccessToken(data.accessToken);
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error("Login error in AuthProvider:", error);
      return { 
        error: "An unexpected error occurred during login",
        success: false 
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "student" | "instructor"
  ) => {
    try {
      const data = await authAPI.register(
        email,
        password,
        firstName,
        lastName,
        role
      );
      
      console.log("AuthProvider register response:", data);
      
      return data;
    } catch (error) {
      console.error("Register error in AuthProvider:", error);
      return { 
        error: "An unexpected error occurred during registration",
        success: false 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAccessToken(null);
  };

  const refreshAccessToken = async () => {
    try {
      // Prevent multiple simultaneous refresh attempts
      if (!accessToken) {
        return;
      }

      const res = await fetch(
        "http://localhost:3000/api/auth/refresh-access-token",
        {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        logout();
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAccessToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};