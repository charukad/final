import axios from 'axios';

const LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'local-model'; // LM Studio usually auto-detects the model

// Create axios instance for LM Studio API
const lmStudioApi = axios.create({
  baseURL: LM_STUDIO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate content with LM Studio
export const generateContent = async (prompt, context = null, options = {}) => {
  try {
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;

    // Build the complete prompt with context
    const completePrompt = context 
      ? `${context}\n\n${prompt}`
      : prompt;

    const response = await lmStudioApi.post('/chat/completions', {
      model: options.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: completePrompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: options.topP || 0.95,
      stream: false
    });

    // Extract the generated text from the response
    const result = response.data.choices[0].message.content;
    
    return {
      content: result,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error("LM Studio API error:", error.response?.data || error.message);
    throw error;
  }
};

// Grammar and spelling check with LM Studio
export const checkGrammarAndSpelling = async (text, options = {}) => {
  try {
    const prompt = `Please analyze the following text for ${
      options.checkGrammar ? "grammar, " : ""
    }${options.checkSpelling ? "spelling, " : ""}${options.checkStyle ? "style, " : ""}issues. 
    For each issue, provide the problematic text, the type of issue, and a suggested correction.
    Format your response as a JSON array with objects containing:
    1. "original": the original problematic text
    2. "type": the type of issue (grammar, spelling, style, etc.)
    3. "suggestion": your suggested correction
    4. "explanation": brief explanation of the issue
    5. "position": approximate character position in the text
    
    Text to analyze:
    "${text}"`;

    const response = await generateContent(prompt, null, { temperature: 0.3 });
    
    // Parse the response as JSON (assuming it's properly formatted)
    let suggestions;
    try {
      const jsonStart = response.content.indexOf("[");
      const jsonEnd = response.content.lastIndexOf("]") + 1;
      const jsonString = response.content.substring(jsonStart, jsonEnd);
      suggestions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing LM Studio response:", parseError);
      
      // Fallback to returning the raw response
      return {
        suggestions: [],
        rawResponse: response.content,
      };
    }

    return { suggestions };
  } catch (error) {
    console.error("Grammar check error:", error);
    throw error;
  }
};

// Text summarization with LM Studio
export const summarizeText = async (text, ratio = 0.3) => {
  try {
    // Calculate paragraph count based on text length and ratio
    const paragraphCount = Math.max(
      1,
      Math.min(5, Math.ceil((text.length / 500) * ratio))
    );
    
    const prompt = `Please create a concise summary of the following text in about ${paragraphCount} paragraphs:
    
    "${text}"`;

    const response = await generateContent(prompt, null, { temperature: 0.5 });
    
    return {
      abstractive: response.content,
      originalLength: text.length,
      summaryLength: response.content.length,
      compressionRatio: response.content.length / text.length
    };
  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
};

// Research assistant with LM Studio
export const researchTopic = async (topic, depth = "medium", perspective = null) => {
  try {
    // Create prompt for LM Studio
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

    const response = await generateContent(prompt, null, { 
      temperature: 0.4,
      maxTokens: 2000 // Allow more tokens for research
    });

    return {
      research: response.content,
      topic
    };
  } catch (error) {
    console.error("Research assistant error:", error);
    throw error;
  }
};

// Text analysis with LM Studio
export const analyzeText = async (text) => {
  try {
    const prompt = `Analyze the following text and provide insights about:
    1. Main topics and themes
    2. Writing style and tone
    3. Structure and organization
    4. Key arguments or points
    5. Readability and complexity
    
    Please format your response in a structured way with clear sections.
    
    Text to analyze:
    "${text}"`;

    const response = await generateContent(prompt, null, { temperature: 0.4 });
    
    return {
      analysis: response.content,
      wordCount: text.split(/\s+/).length,
      characterCount: text.length
    };
  } catch (error) {
    console.error("Text analysis error:", error);
    throw error;
  }
};

// Style suggestions with LM Studio
export const getStyleSuggestions = async (text, target = "general") => {
  try {
    const targetDescriptions = {
      academic: "formal academic writing with citations and scholarly tone",
      business: "professional business communication",
      creative: "creative and engaging writing",
      technical: "clear technical documentation",
      general: "clear and engaging general writing"
    };

    const prompt = `Analyze the following text and provide style suggestions to improve it for ${targetDescriptions[target] || targetDescriptions.general}.
    
    Please provide specific suggestions for:
    1. Word choice and vocabulary
    2. Sentence structure and flow
    3. Tone and voice
    4. Clarity and conciseness
    
    Text to analyze:
    "${text}"`;

    const response = await generateContent(prompt, null, { temperature: 0.4 });
    
    return {
      suggestions: response.content,
      target
    };
  } catch (error) {
    console.error("Style suggestions error:", error);
    throw error;
  }
};

// Topic insights with LM Studio
export const getTopicInsights = async (topic) => {
  try {
    const prompt = `Provide insights and key information about the topic: "${topic}"
    
    Include:
    1. Definition and overview
    2. Key concepts and terminology
    3. Current trends and developments
    4. Related topics and connections
    5. Practical applications
    
    Format your response in a well-organized manner with clear sections.`;

    const response = await generateContent(prompt, null, { 
      temperature: 0.4,
      maxTokens: 1500
    });
    
    return {
      insights: response.content,
      topic
    };
  } catch (error) {
    console.error("Topic insights error:", error);
    throw error;
  }
};

// Chat with LM Studio (for AI chat components)
export const chatWithLMStudio = async (messages, noteContext = null) => {
  try {
    // Convert messages to OpenAI format
    const chatMessages = messages.map(msg => ({
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      content: msg.content || msg.text
    }));

    // Add system message with context if provided
    if (noteContext) {
      chatMessages.unshift({
        role: 'system',
        content: `You are NoteFlow+, an AI assistant. Here's the current note context: ${noteContext}`
      });
    } else {
      chatMessages.unshift({
        role: 'system',
        content: 'You are NoteFlow+, an AI assistant.'
      });
    }

    const response = await lmStudioApi.post('/chat/completions', {
      model: DEFAULT_MODEL,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    });

    return {
      content: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error("Chat with LM Studio error:", error);
    throw error;
  }
};

// Backward compatibility alias
export const chatWithGemini = chatWithLMStudio; 