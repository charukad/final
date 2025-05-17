const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Use the same JWT secret fallback approach as in auth middleware
const JWT_SECRET = process.env.JWT_SECRET || 'this_is_a_secure_secret_key_for_jwt_signing_123456789';
console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "*"], // Allow multiple origins
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // Increase ping timeout from 5s default to 60s
    pingInterval: 25000, // Increase ping interval from 25s default to 25s
    connectTimeout: 10000, // Increase connection timeout to 10s
    maxHttpBufferSize: 1e8, // Increase max buffer size for large content
  });

  console.log('Socket.io initialized with options:', {
    origins: ["http://localhost:5173", "http://localhost:3000", "*"],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 10000,
  });

  // Error handling for the IO server itself
  io.engine.on("connection_error", (err) => {
    console.error("Socket.io connection error:", err);
  });

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('Socket connection attempt with token:', token ? 'Present' : 'Missing');

      if (!token) {
        console.log("Socket auth failed: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token with the consistent JWT secret
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified for user ID:', decoded.id);

      // Find user by ID
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log(`Socket auth failed: User not found for ID ${decoded.id}`);
        return next(new Error("User not found"));
      }

      // Attach user info to socket
      socket.user = {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
      };

      console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Enhanced error handling for the socket
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user.id}:`, error);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id}), reason: ${reason}`);
    });

    // Handle reconnection attempts
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt} for user: ${socket.user.name}`);
    });

    // Import socket event handlers
    require("../sockets/noteSocket")(io, socket);
    require("../sockets/collaborationSocket")(io, socket);
  });

  return io;
};

// Get io instance
const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
};
