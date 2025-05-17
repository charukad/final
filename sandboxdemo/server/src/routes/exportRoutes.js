const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Export a single note
router.get("/note/:id", exportController.exportNote);

// Export multiple notes
router.post("/notes", exportController.exportNotes);

module.exports = router;
