const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
router.use(auth);

// Full search route
router.get("/notes", searchController.searchNotes);

// Get search suggestions
router.get("/suggestions", searchController.getSearchSuggestions);

// Get recent searches
router.get("/recent", searchController.getRecentSearches);

module.exports = router;
