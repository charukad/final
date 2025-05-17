const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Use the same fallback JWT secret as in authController
const JWT_SECRET = process.env.JWT_SECRET || 'this_is_a_secure_secret_key_for_jwt_signing_123456789';

exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // Verify token using the same JWT secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Token is valid, but user not found" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};
