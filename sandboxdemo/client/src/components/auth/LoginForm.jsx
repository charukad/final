import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        console.log("Attempting login with:", { 
            email: formData.email,
          password: "********", // Don't log actual password
          rememberMe 
        });

        // Use the AuthContext login function instead of direct API call
        const success = await login(formData.email, formData.password, rememberMe);
        
        if (success) {
          console.log("Login successful, navigating to dashboard");
        // Login successful, redirect to dashboard
          setTimeout(() => {
            console.log("Executing navigation to /dashboard");
            navigate("/dashboard", { replace: true });
          }, 100);
        } else {
          console.log("Login failed:", authError);
          // Login failed, show error
          setErrors({
            ...errors,
            general: authError || "Login failed. Please check your credentials.",
          });
        }
      } catch (error) {
        console.error("Login submission error:", error);
        // Handle unexpected errors
        setErrors({
          ...errors,
          general: "An unexpected error occurred. Please try again later.",
          });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Additional helper methods
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errors.general && <div className="error-message general">{errors.general}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Your password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "error" : ""}
        />
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>

      <div className="form-extras">
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={toggleRememberMe}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>

      <button
        type="submit"
        className="button primary-button full-width"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
};

export default LoginForm;
