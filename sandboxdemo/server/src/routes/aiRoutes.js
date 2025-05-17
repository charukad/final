const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { auth } = require("../middleware/auth");

// Apply auth middleware to all routes
// router.use(auth); // Temporarily disabled for testing

// Grammar and spelling check
router.post("/grammar-check", aiController.checkGrammarAndSpelling);

// Text summarization
router.post("/summarize", aiController.summarizeText);

// Content generation
router.post("/generate", aiController.generateContent);

// Research assistant
router.post("/research", aiController.researchTopic);

// Text analysis
router.post("/analyze", aiController.analyzeText);

// Style suggestions
router.post("/style-suggestions", aiController.suggestStyleImprovements);

// Topic insights
router.post("/topic-insights", aiController.getTopicInsights);

// Language detection
router.post("/detect-language", aiController.detectLanguage);

module.exports = router;
