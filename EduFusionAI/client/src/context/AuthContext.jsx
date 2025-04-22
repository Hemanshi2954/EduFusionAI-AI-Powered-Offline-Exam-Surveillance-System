import { createContext, useState, useEffect } from "react";
import { mockApiRequest } from "../mock/mockApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would check with the server
        const storedUser = localStorage.getItem("eduUser");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      // In a real app, this would authenticate with the server
      const response = await mockApiRequest("/auth/login", "POST", credentials);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("eduUser", JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login" };
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      // In a real app, this would register with the server
      const response = await mockApiRequest("/auth/register", "POST", userData);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("eduUser", JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "An error occurred during registration" };
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("eduUser");
  };
  
  // Update user profile
  const updateProfile = async (updates) => {
    try {
      // In a real app, this would update with the server
      const response = await mockApiRequest("/auth/profile", "PATCH", updates);
      
      if (response.success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem("eduUser", JSON.stringify(updatedUser));
        return { success: true };
      } else {
        return { success: false, message: response.message || "Profile update failed" };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "An error occurred while updating profile" };
    }
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
