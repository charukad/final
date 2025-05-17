const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all folders for current user
router.get("/", folderController.getFolders);

// Create a new folder
router.post("/", folderController.createFolder);

// Update a folder
router.put("/:id", folderController.updateFolder);

// Delete a folder
router.delete("/:id", folderController.deleteFolder);

module.exports = router;
