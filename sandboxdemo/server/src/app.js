const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const { initializeSocket, getIo } = require("./config/socket");
require("dotenv").config();
const path = require("path");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
// Increase JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
// Add URL-encoded parser with increased limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState;
    const mongoStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[mongoStatus] || 'unknown';
    
    let socketStatus = { initialized: false, connections: 0 };
    
    try {
      const io = getIo();
      socketStatus = {
        initialized: true,
        connections: io.engine.clientsCount
      };
    } catch (err) {
      console.log('Socket.io not initialized yet');
    }
    
    res.status(200).json({
      status: 'ok',
      server: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      database: {
        status: mongoStatusText,
        statusCode: mongoStatus
      },
      socket: socketStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const folderRoutes = require("./routes/folderRoutes");
const tagRoutes = require("./routes/tagRoutes");
const exportRoutes = require("./routes/exportRoutes");
const importRoutes = require("./routes/importRoutes");
const fileRoutes = require("./routes/fileRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/import", importRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ai", aiRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
