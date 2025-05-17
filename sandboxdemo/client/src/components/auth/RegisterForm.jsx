import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number and special character";
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Call API to register user
        await axios.post(
          "http://localhost:5001/api/auth/register",
          {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
          }
        );

        // Registration successful
        console.log("Registration successful");
        setErrors({});
        
        // Show success message and redirect to login
        alert("Account created successfully! Please check your email for verification instructions.");
        navigate("/login");
      } catch (error) {
        // Handle API errors
        if (error.response && error.response.data) {
          if (error.response.data.field) {
            setErrors({
              ...errors,
              [error.response.data.field]: error.response.data.message,
            });
          } else {
            setErrors({
              ...errors,
              general:
                error.response.data.message ||
                "Registration failed. Please try again.",
            });
          }
        } else {
          setErrors({
            ...errors,
            general: "Network error. Please try again later.",
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errors.general && (
        <div className="error-message general">{errors.general}</div>
      )}

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={errors.fullName ? "error" : ""}
        />
        {errors.fullName && (
          <div className="error-message">{errors.fullName}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
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
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "error" : ""}
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
        <div className="password-strength">
          {/* Password strength indicator would go here */}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? "error" : ""}
        />
        {errors.confirmPassword && (
          <div className="error-message">{errors.confirmPassword}</div>
        )}
      </div>

      <div className="form-group checkbox">
        <input
          type="checkbox"
          id="terms"
          checked={agreeToTerms}
          onChange={() => setAgreeToTerms(!agreeToTerms)}
        />
        <label htmlFor="terms">
          I agree to the{" "}
          <a href="/terms" target="_blank">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank">
            Privacy Policy
          </a>
        </label>
        {errors.terms && <div className="error-message">{errors.terms}</div>}
      </div>

      <button
        type="submit"
        className="button primary-button full-width"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};

export default RegisterForm;
