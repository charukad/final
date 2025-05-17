const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Get all notes for current user
router.get("/", noteController.getNotes);

// Get a specific note
router.get("/:id", noteController.getNoteById);

// Create a new note
router.post("/", noteController.createNote);

// Update a note
router.put("/:id", noteController.updateNote);

// Upload image for a note
router.post("/:id/images", noteController.uploadImage);

// Move a note to trash
router.put("/:id/trash", noteController.trashNote);

// Restore a note from trash
router.put("/:id/restore", noteController.restoreNote);

// Permanently delete a note
router.delete("/:id", noteController.deleteNote);

module.exports = router;
