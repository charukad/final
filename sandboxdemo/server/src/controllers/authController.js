const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// You'll need to set up an email service like Nodemailer here
// const sendEmail = require('../utils/emailService');

// Hard-coded JWT secret as fallback
const JWT_SECRET = process.env.JWT_SECRET || 'this_is_a_secure_secret_key_for_jwt_signing_123456789';

// Helper to generate tokens
const generateToken = (id) => {
  // Use the hardcoded secret or environment variable
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        field: "email",
        message: "Email already registered",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    // In a real application, you would send an email here
    /* 
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `Click <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">here</a> to verify your email.`
    });
    */

    // For development, return the token directly
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      verificationToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Verify email address
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    /*if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }*/

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Forgot password functionality
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    // In a real application, you would send an email here
    /*
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `Click <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">here</a> to reset your password.`
    });
    */

    // For development, return the token directly
    res.status(200).json({
      message: "Password reset email sent",
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Server error during password reset request" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

// Validate token
exports.validateToken = async (req, res) => {
  try {
    // If this middleware is reached, token is valid and user is authenticated
    res.status(200).json({
      valid: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ 
      valid: false,
      message: "Invalid or expired token" 
    });
  }
};
