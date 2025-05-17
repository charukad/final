import api from "./api";

// Grammar and spelling check
export const checkGrammarAndSpelling = async (text, options = {}) => {
  try {
    const response = await api.post("/ai/grammar-check", {
      text,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error("Grammar check error:", error);
    throw error;
  }
};

// Text summarization
export const summarizeText = async (text, ratio = 0.3) => {
  try {
    const response = await api.post("/ai/summarize", {
      text,
      ratio,
    });
    return response.data;
  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
};

// Content generation
export const generateContent = async (prompt, context = null, options = {}) => {
  try {
    const response = await api.post("/ai/generate", {
      prompt,
      context,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error("Content generation error:", error);
    throw error;
  }
};

// Research assistant
export const researchTopic = async (
  topic,
  depth = "medium",
  perspective = null
) => {
  try {
    const response = await api.post("/ai/research", {
      topic,
      depth,
      perspective,
    });
    return response.data;
  } catch (error) {
    console.error("Research error:", error);
    throw error;
  }
};

// Text analysis
export const analyzeText = async (text) => {
  try {
    const response = await api.post("/ai/analyze", {
      text,
    });
    return response.data;
  } catch (error) {
    console.error("Text analysis error:", error);
    throw error;
  }
};

// Style suggestions
export const getStyleSuggestions = async (text, target = "general") => {
  try {
    const response = await api.post("/ai/style-suggestions", {
      text,
      target,
    });
    return response.data;
  } catch (error) {
    console.error("Style suggestions error:", error);
    throw error;
  }
};

// Topic insights
export const getTopicInsights = async (topic) => {
  try {
    const response = await api.post("/ai/topic-insights", {
      topic,
    });
    return response.data;
  } catch (error) {
    console.error("Topic insights error:", error);
    throw error;
  }
};

// Language detection
export const detectLanguage = async (text) => {
  try {
    const response = await api.post("/ai/detect-language", {
      text,
    });
    return response.data;
  } catch (error) {
    console.error("Language detection error:", error);
    throw error;
  }
};
