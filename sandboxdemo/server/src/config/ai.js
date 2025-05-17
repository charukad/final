require("dotenv").config();

// Gemini configuration
const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyDrjYMSPjKMhLBs6S0HqkpTTFoVOem4cME',
  defaultModel: "gemini-2.0-flash",
  temperature: 0.7,
  maxTokens: 1000,
};

// Language detection and processing config
const nlpConfig = {
  minConfidence: 0.7,
  supportedLanguages: [
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "nl",
    "ru",
    "zh",
    "ja",
  ],
};

// Summarization settings
const summaryConfig = {
  defaultRatio: 0.3, // Summary length as % of original
  minSentences: 3,
  maxSentences: 10,
};

// Grammar check configuration
const grammarConfig = {
  checkSpelling: true,
  checkGrammar: true,
  checkStyle: true,
  suggestSynonyms: true,
};

// Citation and fact checking
const factCheckConfig = {
  verifyFacts: true,
  suggestCitations: true,
  confidenceThreshold: 0.8,
};

// Rate limiting for AI features
const rateLimits = {
  grammarCheck: 100, // Requests per day
  summarization: 50, // Requests per day
  contentGeneration: 20, // Requests per day
  researchAssistant: 30, // Requests per day
};

module.exports = {
  geminiConfig,
  nlpConfig,
  summaryConfig,
  grammarConfig,
  factCheckConfig,
  rateLimits,
};
