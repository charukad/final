const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Import from file
router.post("/file", importController.importFile);

// Import from clipboard
router.post("/clipboard", importController.importFromClipboard);

module.exports = router;
