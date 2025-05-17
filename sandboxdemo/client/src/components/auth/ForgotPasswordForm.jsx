import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call API to request password reset
      const response = await axios.post(
        "http://localhost:5001/api/auth/forgot-password",
        {
          email,
        }
      );

      setMessage(
        response.data.message || "Password reset email has been sent."
      );
      setSubmitted(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Failed to process request.");
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the form was submitted successfully, show confirmation message
  if (submitted) {
    return (
      <div className="forgot-password-confirmation">
        <div className="icon-success">✓</div>
        <h3>Check Your Email</h3>
        <p>
          We've sent a password reset link to <strong>{email}</strong>. Please
          check your inbox and follow the instructions to reset your password.
        </p>
        <p className="note">
          If you don't see the email, please check your spam folder.
        </p>
        <div className="actions">
          <Link to="/login" className="button secondary-button">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="error-message general">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          className={error ? "error" : ""}
        />
      </div>

      <button
        type="submit"
        className="button primary-button full-width"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
