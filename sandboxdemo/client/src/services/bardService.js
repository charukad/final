import axios from 'axios';

// This would be replaced with actual Bard API key in production
const BARD_API_KEY = 'AIzaSyDrjYMSPjKMhLBs6S0HqkpTTFoVOem4cME'; // Using Gemini key for demo
const BARD_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash'; // Using Gemini model as proxy since we're simulating Bard

// Create axios instance for Bard API
const bardApi = axios.create({
  baseURL: BARD_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate math-specific content with Bard/Gemini
export const generateMathContent = async (prompt, context = null, options = {}) => {
  try {
    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature || 0.3; // Lower temperature for more precise math responses

    // Build the complete prompt with context and specialized math instructions
    let completePrompt = '';
    
    if (context) {
      completePrompt = `${context}\n\n`;
    }
    
    completePrompt += `You are a specialized math assistant. ${prompt}`;

    // Add additional instructions for formatting math output
    completePrompt += `\n\nPlease format any mathematical expressions using proper notation. 
                      Use markdown format for equations when appropriate. 
                      Show all steps clearly when solving problems.`;

    const response = await bardApi.post(
      `/${model}:generateContent?key=${BARD_API_KEY}`,
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
          maxOutputTokens: options.maxTokens || 1500, // Allow more tokens for detailed math explanations
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
        promptTokens: 0, // API doesn't provide token counts in this way
        completionTokens: 0,
        totalTokens: 0
      }
    };
  } catch (error) {
    console.error("Math API error:", error.response?.data || error.message);
    throw error;
  }
};

// Get step-by-step solution for a math problem
export const getSolution = async (problem, level = 'medium') => {
  try {
    const detailLevel = level === 'advanced' 
      ? 'detailed, advanced level'
      : level === 'medium' 
      ? 'moderately detailed, intermediate level'
      : 'simple, beginner level';
      
    const prompt = `Solve this math problem step by step with ${detailLevel} explanations: "${problem}"`;
    
    const response = await generateMathContent(prompt, null, { temperature: 0.2 });
    
    return {
      solution: response.content,
      problem
    };
  } catch (error) {
    console.error("Math solution error:", error);
    throw error;
  }
};

// Generate math concept explanations
export const explainMathConcept = async (concept, level = 'medium') => {
  try {
    const detailLevel = level === 'advanced' 
      ? 'detailed, advanced level'
      : level === 'medium' 
      ? 'clear, intermediate level'
      : 'simple, beginner friendly';
      
    const prompt = `Explain the math concept "${concept}" in ${detailLevel} terms. Include key formulas, practical examples, and applications.`;
    
    const response = await generateMathContent(prompt, null, { temperature: 0.3 });
    
    return {
      explanation: response.content,
      concept
    };
  } catch (error) {
    console.error("Math explanation error:", error);
    throw error;
  }
};

// Generate visualization descriptions for math concepts
export const describeMathVisualization = async (concept) => {
  try {
    const prompt = `Describe how to visualize the math concept "${concept}". Include details about what the visualization should look like, key elements to include, and how it helps understand the concept.`;
    
    const response = await generateMathContent(prompt, null, { temperature: 0.4 });
    
    return {
      visualization: response.content,
      concept
    };
  } catch (error) {
    console.error("Math visualization error:", error);
    throw error;
  }
}; 