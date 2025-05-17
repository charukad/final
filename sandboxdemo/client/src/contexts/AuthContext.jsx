import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Create Auth Context
const AuthContext = createContext();

// Export custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Get token and user data from storage
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!token || !userStr) {
          console.log("No authentication data found");
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        try {
          // Set auth header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Parse and set user
        const user = JSON.parse(userStr);
          console.log("Found user in storage:", user.email);

          // Set the current user
          setCurrentUser(user);
          
          // Optionally validate token with the server
          try {
            // Silent validation - just to check if token is still valid
            await axios.get("http://localhost:5001/api/auth/validate-token");
            console.log("Token validated successfully");
          } catch (validationError) {
            console.error("Token validation failed:", validationError.message);
            // Token is invalid, clear auth data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            delete axios.defaults.headers.common["Authorization"];
            setCurrentUser(null);
          }
        } catch (error) {
          // Clear invalid data
          console.error("Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          delete axios.defaults.headers.common["Authorization"];
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Failed to load user data");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);

    try {
      // Call API to login user
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password }
      );

      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }

      // Store token and user data
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", response.data.token);
      
      const userData = {
        id: response.data._id,
        fullName: response.data.fullName,
        email: response.data.email,
      };
      
      storage.setItem("user", JSON.stringify(userData));
      console.log("User data stored successfully", userData);

      // Set auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      // Update state
      setCurrentUser(userData);
      console.log("Authentication successful, user state updated");

      return true;
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Login failed");
      } else {
        setError("Network error. Please try again later.");
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user");
    
    // Remove tokens from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Remove auth header
    delete axios.defaults.headers.common["Authorization"];

    // Reset state
    setCurrentUser(null);
  };

  // Provide auth context values
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
