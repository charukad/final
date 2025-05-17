import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";
import "../styles/AuthPages.css";

const RegisterPage = () => {
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

  // Only render register page if not authenticated
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            NoteFlow
          </Link>
          <h2>Create Your Account</h2>
          <p>Join thousands of users organizing their thoughts better</p>
        </div>

        <RegisterForm />

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      <div className="auth-info">
        <div className="info-content">
          <h3>Why join NoteFlow?</h3>
          <ul>
            <li>Intelligent note organization</li>
            <li>AI-powered writing assistance</li>
            <li>Seamless collaboration</li>
            <li>Cross-platform availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
