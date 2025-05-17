import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AuthPages.css";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate token on page load
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Call API to validate token (you'll need to create this endpoint)
        const response = await axios.get(
          `http://localhost:5001/api/auth/reset-password/${token}/validate`
        );
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call API to reset password
      const response = await axios.post(
        `http://localhost:5001/api/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setResetSuccess(true);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Failed to reset password.");
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If token is invalid
  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="logo">
              NoteFlow
            </Link>
            <h2>Invalid Reset Link</h2>
          </div>
          <div className="token-error">
            <p>{error}</p>
            <Link to="/forgot-password" className="button primary-button">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If reset was successful
  if (resetSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="logo">
              NoteFlow
            </Link>
            <h2>Password Reset Successful</h2>
          </div>
          <div className="reset-success">
            <div className="icon-success">✓</div>
            <p>
              Your password has been successfully reset. You will be redirected
              to the login page shortly.
            </p>
            <Link to="/login" className="button primary-button">
              Log In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            NoteFlow
          </Link>
          <h2>Reset Password</h2>
          <p>Create a new password for your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message general">{error}</div>}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={
                error && error.includes("Password must") ? "error" : ""
              }
            />
            <div className="password-requirements">
              Password must be at least 8 characters long and include letters,
              numbers, and symbols.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={error && error.includes("match") ? "error" : ""}
            />
          </div>

          <button
            type="submit"
            className="button primary-button full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
