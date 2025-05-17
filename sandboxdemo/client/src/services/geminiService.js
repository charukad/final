import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyDrjYMSPjKMhLBs6S0HqkpTTFoVOem4cME';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

// Create axios instance for Gemini API
const geminiApi = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate content with Gemini
export const generateContent = async (prompt, context = null, options = {}) => {
  try {
    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature || 0.7;
    const maxOutputTokens = options.maxTokens || 1000;

    // Build the complete prompt with context
    const completePrompt = context 
      ? `${context}\n\n${prompt}`
      : prompt;

    const response = await geminiApi.post(
      `/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: completePrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
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
    const result = response.data.candidates[0].content.parts[0].text;
    
    return {
      content: result,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts in this way
        completionTokens: 0,
        totalTokens: 0
      }
    };
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw error;
  }
};

// Grammar and spelling check with Gemini
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
      console.error("Error parsing Gemini response:", parseError);
      
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

// Text summarization with Gemini
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

// Research assistant with Gemini
export const researchTopic = async (topic, depth = "medium", perspective = null) => {
  try {
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

// Text analysis with Gemini
export const analyzeText = async (text) => {
  try {
    const prompt = `Analyze the following text and provide insights about:
    1. Main topics and themes
    2. Writing style and tone
    3. Structure and organization
    4. Key arguments or points
    5. Suggestions for improvement
    
    Format your response as a JSON object with these sections.
    
    Text to analyze:
    "${text.substring(0, 4000)}${text.length > 4000 ? '...' : ''}"`;

    const response = await generateContent(prompt, null, { temperature: 0.3 });
    
    return {
      analysis: response.content
    };
  } catch (error) {
    console.error("Text analysis error:", error);
    throw error;
  }
};

// Style suggestions with Gemini
export const getStyleSuggestions = async (text, target = "general") => {
  try {
    const prompt = `Analyze the writing style of the following text and provide suggestions to improve it for a ${target} audience.
    Focus on tone, clarity, engagement, and readability.
    Format your response as a JSON array of suggestion objects with:
    1. "issue": the identified style issue
    2. "suggestion": your recommended improvement
    3. "example": an example showing how to apply the suggestion
    
    Text to analyze:
    "${text.substring(0, 4000)}${text.length > 4000 ? '...' : ''}"`;

    const response = await generateContent(prompt, null, { temperature: 0.4 });
    
    return {
      suggestions: response.content
    };
  } catch (error) {
    console.error("Style suggestions error:", error);
    throw error;
  }
};

// Topic insights with Gemini
export const getTopicInsights = async (topic) => {
  try {
    const prompt = `Provide comprehensive insights about the topic: "${topic}"
    Include:
    1. Key concepts and definitions
    2. Historical context and development
    3. Current relevance and applications
    4. Different perspectives or approaches
    5. Related topics and connections
    
    Format your response in well-organized sections.`;

    const response = await generateContent(prompt, null, { temperature: 0.4 });
    
    return {
      insights: response.content,
      topic
    };
  } catch (error) {
    console.error("Topic insights error:", error);
    throw error;
  }
};

// Chat with Gemini (for AI chat components)
export const chatWithGemini = async (messages, noteContext = null) => {
  try {
    // Check if the last user message is asking about the AI's name
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      const lowercaseContent = lastMessage.content.toLowerCase().trim();
      if (
        lowercaseContent === 'what is your name?' || 
        lowercaseContent === 'what is your name' ||
        lowercaseContent === 'who are you?' ||
        lowercaseContent === 'who are you' ||
        lowercaseContent === 'what should i call you?' ||
        lowercaseContent === 'what should i call you' ||
        lowercaseContent === 'what\'s your name?' ||
        lowercaseContent === 'what\'s your name'
      ) {
        return {
          role: 'assistant',
          content: 'My name is NoteFlow+. I\'m your AI writing assistant  How can I help you with your notes today?'
        };
      }
    }
    
    // For other queries, convert messages to a format Gemini can understand
    const formattedMessages = messages.map(msg => {
      return `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`;
    }).join('\n\n');
    
    // Include name instruction and note context
    const nameInstruction = 'Always refer to yourself as "NoteFlow+" if asked about your name or identity.';
    
    // Include note context if available
    const contextPrefix = noteContext 
      ? `The following is a conversation between a human and an AI assistant named NoteFlow+ about a note with the following content: "${noteContext.substring(0, 500)}${noteContext.length > 500 ? '...' : ''}"\n\n${nameInstruction}\n\n`
      : `The following is a conversation between a human and an AI assistant named NoteFlow+. The assistant is helpful, creative, and knowledgeable about writing and note-taking.\n\n${nameInstruction}\n\n`;
    
    const prompt = `${contextPrefix}${formattedMessages}\n\nAssistant:`;
    
    const response = await generateContent(prompt, null, { temperature: 0.7 });
    
    return {
      role: 'assistant',
      content: response.content.trim()
    };
  } catch (error) {
    console.error("Chat with Gemini error:", error);
    throw error;
  }
}; 