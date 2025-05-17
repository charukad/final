const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");

// Registration route
router.post("/register", authController.register);

// Email verification
router.get("/verify/:token", authController.verifyEmail);

// Login route
router.post("/login", authController.login);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password/:token", authController.resetPassword);

// Token validation route (protected)
router.get("/validate-token", auth, authController.validateToken);

module.exports = router;
