import React from "react";
import { Link } from "react-router-dom";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import "../styles/AuthPages.css";

const ForgotPasswordPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            NoteFlow
          </Link>
          <h2>Forgot Password</h2>
          <p>Enter your email address to receive a password reset link</p>
        </div>

        <ForgotPasswordForm />

        <div className="auth-footer">
          <p>
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
