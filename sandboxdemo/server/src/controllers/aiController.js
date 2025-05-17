const axios = require("axios");
const natural = require("natural");
const compromise = require("compromise");
const summarizer = require("node-summarizer");
const sentiment = require("sentiment");
const config = require("../config/ai");

// Initialize Gemini API configuration with fallback for missing API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDrjYMSPjKMhLBs6S0HqkpTTFoVOem4cME';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

// Create axios instance for Gemini API
const geminiApi = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if Gemini API is available
const isGeminiAvailable = () => {
  return !!GEMINI_API_KEY;
};

// Helper function to generate content with Gemini
const generateGeminiContent = async (prompt, temperature = 0.7, maxTokens = 1000) => {
  try {
    // Add identity instruction to ensure AI identifies as NoteFlow+
    const identityInstruction = 'Your name is NoteFlow+. If asked about your name or identity, always respond that you are NoteFlow+.';
    const promptWithIdentity = `${identityInstruction}\n\n${prompt}`;
    
    const response = await geminiApi.post(
      `/${DEFAULT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: promptWithIdentity
              }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
    );

    // Extract the generated text from the response
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw error;
  }
};

// Grammar and spelling check
exports.checkGrammarAndSpelling = async (req, res) => {
  try {
    const { text, checkSpelling, checkGrammar, checkStyle } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Check if Gemini is available
    if (!isGeminiAvailable()) {
      return res.status(503).json({ 
        message: "AI service is currently unavailable. Please check the Gemini API key." 
      });
    }

    // Create prompt for Gemini
    const prompt = `Please analyze the following text for ${
      checkGrammar ? "grammar, " : ""
    }${checkSpelling ? "spelling, " : ""}${checkStyle ? "style, " : ""}issues. 
    For each issue, provide the problematic text, the type of issue, and a suggested correction.
    Format your response as a JSON array with objects containing:
    1. "original": the original problematic text
    2. "type": the type of issue (grammar, spelling, style, etc.)
    3. "suggestion": your suggested correction
    4. "explanation": brief explanation of the issue
    5. "position": approximate character position in the text
    
    Text to analyze:
    "${text}"`;

    const generatedText = await generateGeminiContent(prompt, 0.3, config.geminiConfig.maxTokens);

    // Parse the response as JSON (assuming it's properly formatted)
    let suggestions;
    try {
      const jsonStart = generatedText.indexOf("[");
      const jsonEnd = generatedText.lastIndexOf("]") + 1;
      const jsonString = generatedText.substring(jsonStart, jsonEnd);
      suggestions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);

      // Fallback to returning the raw response
      return res.json({
        suggestions: [],
        rawResponse: generatedText,
      });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Grammar check error:", error);
    res.status(500).json({ message: "Error checking grammar and spelling" });
  }
};

// Text summarization
exports.summarizeText = async (req, res) => {
  try {
    const { text, ratio } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Check if Gemini is available for abstractive summarization
    const geminiAvailable = isGeminiAvailable();

    // Use node-summarizer for extractive summarization
    const extractiveSummary = new summarizer.SummarizerManager(
      text,
      ratio || config.summaryConfig.defaultRatio
    );
    const extractionResult = extractiveSummary.getSummaryByRank();

    // Result object with extractive summary
    const result = {
      extractive: {
        sentences: extractionResult.summary,
        topSentences: extractionResult.topRanks,
      },
      originalLength: text.length,
    };
    
    // Only attempt Gemini abstractive summarization if available
    if (geminiAvailable) {
      // Use Gemini for abstractive summarization
      const prompt = `Please create a concise summary of the following text in about ${Math.max(
        1,
        Math.min(5, Math.ceil(text.length / 500))
      )} paragraphs:
      
      "${text}"`;

      const abstractiveSummary = await generateGeminiContent(prompt, 0.5, config.geminiConfig.maxTokens);
      
      // Add abstractive summary to result
      result.abstractive = abstractiveSummary;
      result.summaryLength = abstractiveSummary.length;
      result.compressionRatio = abstractiveSummary.length / text.length;
    } else {
      // Add message about missing API key
      result.message = "Abstractive summarization unavailable. Please check the Gemini API key.";
    }

    res.json(result);
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({ message: "Error summarizing text" });
  }
};

// Content generation and completion
exports.generateContent = async (req, res) => {
  try {
    const { context, prompt, temperature, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Build the complete prompt
    const completePrompt = context
      ? `Context: ${context}\n\nPrompt: ${prompt}`
      : prompt;

    const content = await generateGeminiContent(
      completePrompt, 
      temperature || config.geminiConfig.temperature,
      maxTokens || config.geminiConfig.maxTokens
    );

    res.json({
      content,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts in this way
        completionTokens: 0,
        totalTokens: 0
      }
    });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ message: "Error generating content" });
  }
};

// Research assistant
exports.researchTopic = async (req, res) => {
  try {
    const { topic, depth, perspective } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    // Create prompt for Gemini
    const depthDescription =
      depth === "deep"
        ? "comprehensive and detailed"
        : depth === "medium"
        ? "moderately detailed"
        : "concise overview";

    const perspectivePrompt = perspective
      ? `Consider this perspective: ${perspective}.`
      : "Present a balanced perspective.";

    const prompt = `Provide a ${depthDescription} analysis on the topic: "${topic}". ${perspectivePrompt}
    
    Include:
    1. Key concepts and definitions
    2. Important related topics
    3. Major debates or controversies, if any
    4. Recommended resources for further research
    
    Format your response in well-organized markdown with sections and bullet points where appropriate.`;

    const generatedText = await generateGeminiContent(prompt, 0.4, config.geminiConfig.maxTokens * 2);

    res.json({
      research: generatedText,
      topic,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts in this way
        completionTokens: 0,
        totalTokens: 0
      }
    });
  } catch (error) {
    console.error("Research assistant error:", error);
    res.status(500).json({ message: "Error researching topic" });
  }
};

// Text analysis
exports.analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    try {
      // Try using local NLP libraries first
      // Tokenize text
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(text);

      // Process with compromise for entities, topics, etc.
      const doc = compromise(text);
      let people = [], places = [], organizations = [], dates = [], topics = [];
      
      try {
        people = doc.people().out("array");
      } catch (e) {
        console.log("Error extracting people:", e.message);
      }
      
      try {
        places = doc.places().out("array");
      } catch (e) {
        console.log("Error extracting places:", e.message);
      }
      
      try {
        organizations = doc.organizations().out("array");
      } catch (e) {
        console.log("Error extracting organizations:", e.message);
      }
      
      // Skip dates as it seems to be causing issues
      // try {
      //   dates = doc.dates().out("array");
      // } catch (e) {
      //   console.log("Error extracting dates:", e.message);
      // }
      
      try {
        if (typeof doc.topics === 'function') {
          topics = doc.topics().out("array");
        }
      } catch (e) {
        console.log("Error extracting topics:", e.message);
      }

      // Get word count and estimated read time
      const wordCount = tokens.length;
      const readTime = Math.ceil(wordCount / 200); // Avg reading speed: 200 words per minute

      // Get frequency analysis
      const frequencyAnalyzer = new natural.TfIdf();
      frequencyAnalyzer.addDocument(text);
      const keyTerms = [];
      frequencyAnalyzer
        .listTerms(0)
        .slice(0, 10)
        .forEach((item) => {
          keyTerms.push({ term: item.term, frequency: item.tfidf });
        });

      // Get sentiment analysis
      const sentimentAnalysis = sentiment(text);

      // Return analysis results
      return res.json({
        metrics: {
          characters: text.length,
          words: wordCount,
          sentences: text.split(/[.!?]+\s/).length,
          paragraphs: text.split(/\n\s*\n/).length,
          readTime: readTime,
        },
        entities: {
          people,
          places,
          organizations,
          dates,
        },
        topics,
        keyTerms,
        sentiment: {
          score: sentimentAnalysis.score,
          comparative: sentimentAnalysis.comparative,
          positive: sentimentAnalysis.positive,
          negative: sentimentAnalysis.negative,
        },
      });
    } catch (error) {
      console.log("Error using local NLP libraries, falling back to Gemini:", error.message);
      
      // Fall back to using Gemini API for analysis
      const prompt = `Analyze the following text and provide insights about:
      1. Main topics and themes
      2. Writing style and tone
      3. Structure and organization
      4. Key arguments or points
      5. Suggestions for improvement
      
      Format your response as a JSON object with these sections.
      
      Text to analyze:
      "${text.substring(0, 4000)}${text.length > 4000 ? '...' : ''}"`;

      const generatedText = await generateGeminiContent(prompt, 0.3, config.geminiConfig.maxTokens);
      
      return res.json({
        analysis: generatedText
      });
    }
  } catch (error) {
    console.error("Text analysis error:", error);
    res.status(500).json({ message: "Error analyzing text" });
  }
};

// Writing style suggestions
exports.suggestStyleImprovements = async (req, res) => {
  try {
    const { text, target } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Create a prompt based on the target style
    let stylePrompt;
    switch (target) {
      case "academic":
        stylePrompt =
          "formal, precise, with proper citations and academic terminology";
        break;
      case "business":
        stylePrompt = "professional, concise, clear, and action-oriented";
        break;
      case "creative":
        stylePrompt =
          "engaging, vivid, evocative, with varied sentence structure and rich vocabulary";
        break;
      case "technical":
        stylePrompt =
          "precise, detailed, logical, well-organized, with appropriate technical terminology";
        break;
      case "casual":
        stylePrompt = "conversational, relatable, simple, and friendly";
        break;
      default:
        stylePrompt = "clear, concise, well-structured, and engaging";
    }

    const prompt = `Please review this text and suggest improvements to make it more ${stylePrompt}. For each suggestion, note the specific text that could be improved and provide a recommended rewording.
    
    Format your response as a JSON array with objects containing:
    1. "original": the original text to improve
    2. "suggestion": your suggested improvement
    3. "reason": brief explanation of why this improves the style
    
    Text to analyze:
    "${text}"`;

    const generatedText = await generateGeminiContent(prompt, 0.4, config.geminiConfig.maxTokens);

    // Parse the response as JSON
    let suggestions;
    try {
      const jsonStart = generatedText.indexOf("[");
      const jsonEnd = generatedText.lastIndexOf("]") + 1;
      const jsonString = generatedText.substring(jsonStart, jsonEnd);
      suggestions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);

      // Fallback to returning the raw response
      return res.json({
        suggestions: [],
        rawResponse: generatedText,
      });
    }

    res.json({
      suggestions,
      targetStyle: target,
    });
  } catch (error) {
    console.error("Style suggestions error:", error);
    res.status(500).json({ message: "Error suggesting style improvements" });
  }
};

// Get topic insights and related concepts
exports.getTopicInsights = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = `Please provide insights about the topic "${topic}". Include:
    
    1. A brief description of the topic
    2. 5-7 key related concepts or subtopics
    3. 3-5 alternative perspectives or approaches to this topic
    4. 5-7 related topics that might be interesting to explore
    
    Format your response as a JSON object with the following structure:
    {
      "description": "Brief description of the topic",
      "relatedConcepts": [{"name": "concept name", "description": "brief description"}],
      "perspectives": [{"name": "perspective name", "description": "explanation"}],
      "relatedTopics": [{"name": "related topic", "relevance": "brief explanation of relationship"}]
    }`;

    const generatedText = await generateGeminiContent(prompt, 0.7, config.geminiConfig.maxTokens);

    // Parse the response as JSON
    let insights;
    try {
      const jsonStart = generatedText.indexOf("{");
      const jsonEnd = generatedText.lastIndexOf("}") + 1;
      const jsonString = generatedText.substring(jsonStart, jsonEnd);
      insights = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);

      // Fallback to returning the raw response
      return res.json({
        insights: {},
        rawResponse: generatedText,
      });
    }

    res.json({
      topic,
      insights,
    });
  } catch (error) {
    console.error("Topic insights error:", error);
    res.status(500).json({ message: "Error getting topic insights" });
  }
};

// Detect main language of text
exports.detectLanguage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Use a language detection library
    const languageDetector = new natural.LanguageDetector();
    const detections = languageDetector.detect(text);

    // Return language detection results
    res.json({
      primaryLanguage: detections[0][0],
      confidence: detections[0][1],
      allDetections: detections.slice(0, 3),
    });
  } catch (error) {
    console.error("Language detection error:", error);
    res.status(500).json({ message: "Error detecting language" });
  }
};
