import axios from 'axios';

// LM Studio configuration for math assistance
const LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'local-model';

// Create axios instance for LM Studio API
const lmStudioApi = axios.create({
  baseURL: LM_STUDIO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate math-specific content with LM Studio
export const generateMathContent = async (prompt, context = null, options = {}) => {
  try {
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

    const response = await lmStudioApi.post('/chat/completions', {
      model: options.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a specialized math assistant. Format mathematical expressions using proper notation and show all steps clearly.'
        },
        {
          role: 'user',
          content: completePrompt
        }
      ],
      temperature,
      max_tokens: options.maxTokens || 1500, // Allow more tokens for detailed math explanations
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