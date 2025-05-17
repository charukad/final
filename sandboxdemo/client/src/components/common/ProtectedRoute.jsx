import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Enhanced protected route wrapper with better logging and redirection
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      console.log("ProtectedRoute check:", {
        path: location.pathname,
        isAuthenticated: !!currentUser,
        userId: currentUser?.id || 'none',
        loading
      });
    }
  }, [currentUser, loading, location.pathname]);

  // Show loading state
  if (loading) {
    console.log("Auth loading, showing loading indicator");
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Render children if authenticated
  console.log("User authenticated, rendering protected content");
  return children;
};

export default ProtectedRoute;
