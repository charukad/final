import axios from 'axios';

const MULTIMODAL_API_URL = 'http://localhost:8000/multimodal/central/process';

// Process text via the multimodal endpoint
export const processMultimodal = async (content, input_type = 'text') => {
  try {
    // Create axios instance with longer timeout
    const axiosInstance = axios.create({
      timeout: 60000 // 60 seconds timeout for visualization generation
    });
    
    const response = await axiosInstance.post(MULTIMODAL_API_URL, {
      input_type,
      content
    });
    
    // Check if we have a successful response
    if (response.data && response.data.success) {
      // Handle visualization data specifically
      if (response.data.agent_type === 'visualization') {
        // Check if visualization was successful
        if (response.data.visualization_data && response.data.visualization_data.success) {
          return {
            response_type: 'image',
            content: response.data.visualization_data.image_url || response.data.visualization_data.base64_image,
            metadata: response.data
          };
        } else {
          // Visualization failed but we got a response
          return {
            response_type: 'text',
            content: `I attempted to create a visualization, but encountered an error: ${response.data.visualization_data?.error || 'Unknown error'}. Please check your data format and try again.`,
            metadata: response.data
          };
        }
      }
      
      // Handle other successful responses
      return {
        response_type: 'text',
        content: response.data.content || response.data.message || JSON.stringify(response.data),
        metadata: response.data
      };
    } else {
      // Response structure doesn't match expected format
      return {
        response_type: 'text',
        content: `The service returned an unexpected response format: ${JSON.stringify(response.data)}`,
        metadata: response.data
      };
    }
  } catch (error) {
    console.error("Multimodal API error:", error.response?.data || error.message);
    
    // Return error as response to display to user
    return {
      response_type: 'text',
      content: `I encountered an error connecting to the multimodal service: ${error.message}. Please ensure the service is running at http://localhost:8000.`,
      isError: true
    };
  }
};

// Chat with the multimodal endpoint
export const chatWithMultimodal = async (messages, noteContext = null) => {
  try {
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Build context from previous messages and note context
    let contextContent = '';
    
    if (noteContext && noteContext.trim().length > 0) {
      contextContent += `My current note contains: ${noteContext.substring(0, 500)}${noteContext.length > 500 ? '...' : ''}\n\n`;
    }
    
    // Add previous messages for context (limit to last 5 for brevity)
    if (messages.length > 1) {
      const contextMessages = messages.slice(-6, -1); // Get last 5 messages before the current one
      contextContent += "Previous messages in our conversation:\n";
      contextMessages.forEach(msg => {
        contextContent += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
      contextContent += "\n";
    }
    
    // Add the current message
    contextContent += `User's current question: ${lastMessage.content}`;
    
    // Send to multimodal endpoint
    const result = await processMultimodal(contextContent);
    
    // Handle different response types
    if (result.response_type === 'image') {
      // For image responses, we'll return HTML that embeds the image
      return {
        role: 'assistant',
        content: `<img src="${result.content}" alt="Generated visualization" style="max-width: 100%; border-radius: 8px;" />`,
        isHtml: true
      };
    } else {
      // For text responses
      return {
        role: 'assistant',
        content: result.content || "I'm sorry, I couldn't process that request."
      };
    }
  } catch (error) {
    console.error("Chat with multimodal error:", error);
    return {
      role: 'assistant',
      content: "I'm sorry, I encountered an error connecting to the multimodal service. Please check if the service is running at http://localhost:8000."
    };
  }
}; 