const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all tags for current user
router.get("/", tagController.getTags);

// Create a new tag
router.post("/", tagController.createTag);

// Update a tag
router.put("/:id", tagController.updateTag);

// Delete a tag
router.delete("/:id", tagController.deleteTag);

module.exports = router;
