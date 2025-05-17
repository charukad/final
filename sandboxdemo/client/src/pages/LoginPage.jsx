import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/auth/LoginForm";
import "../styles/AuthPages.css";

const LoginPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Only render login page if not authenticated
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            NoteFlow
          </Link>
          <h2>Welcome Back</h2>
          <p>Log in to access your notes and continue your work</p>
        </div>

        <LoginForm />

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>

      <div className="auth-info">
        <div className="info-content">
          <h3>What's New</h3>
          <ul>
            <li>Enhanced AI writing suggestions</li>
            <li>Real-time collaboration updates</li>
            <li>New organization templates</li>
            <li>Improved search capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
