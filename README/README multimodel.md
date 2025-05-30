# Frontend Services Documentation

This directory contains all frontend service modules for API communication and AI integration.

## Service Overview

```
services/
├── lmStudioService.js      # Main LM Studio AI integration
├── bardService.js          # Math-specific AI service
├── aiService.js           # General AI utilities
├── api.js                 # Core API configuration
├── socketService.js       # Real-time communication
├── noteService.js         # Note management
├── fileService.js         # File upload/download
├── multimodalService.js   # Multimodal AI features
├── searchService.js       # Search functionality
├── exportService.js       # Export utilities
├── importService.js       # Import utilities
├── folderService.js       # Folder management
└── tagService.js          # Tag management
```

## LM Studio Service (`lmStudioService.js`)

### Overview
Main service for integrating with LM Studio's local AI server. Provides all AI functionality including chat, text analysis, and content generation.

### Configuration
```javascript
const LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'local-model';
```

### Core Functions

#### `generateContent(prompt, context, options)`
Basic content generation using LM Studio.

**Parameters:**
- `prompt` (string): The user prompt
- `context` (string, optional): Additional context
- `options` (object, optional): Generation options

**Options:**
```javascript
{
  model: 'local-model',        // Model to use
  temperature: 0.7,            // Creativity level (0-1)
  maxTokens: 1000,            // Maximum response length
  topP: 0.95,                 // Nucleus sampling
}
```

**Example:**
```javascript
import { generateContent } from './lmStudioService';

const result = await generateContent(
  "Write a summary about artificial intelligence",
  "This is for a technical blog post",
  { temperature: 0.5, maxTokens: 500 }
);
console.log(result.content);
```

#### `chatWithLMStudio(messages, noteContext)`
Interactive chat functionality with conversation history.

**Parameters:**
- `messages` (array): Conversation history
- `noteContext` (string, optional): Current note content for context

**Message Format:**
```javascript
{
  role: 'user|assistant|system',
  content: 'message text'
}
```

**Example:**
```javascript
const messages = [
  { role: 'user', content: 'Help me improve this paragraph...' }
];

const response = await chatWithLMStudio(messages, noteContent);
```

#### `checkGrammarAndSpelling(text, options)`
Grammar and spelling analysis.

**Parameters:**
- `text` (string): Text to analyze
- `options` (object): Check options

**Options:**
```javascript
{
  checkGrammar: true,
  checkSpelling: true,
  checkStyle: true
}
```

**Returns:**
```javascript
{
  suggestions: [
    {
      original: "problematic text",
      type: "grammar|spelling|style",
      suggestion: "corrected text",
      explanation: "reason for correction",
      position: 42
    }
  ]
}
```

#### `summarizeText(text, ratio)`
Text summarization with adjustable compression.

**Parameters:**
- `text` (string): Text to summarize
- `ratio` (number): Summary length ratio (0.1-1.0)

**Example:**
```javascript
const summary = await summarizeText(longText, 0.3);
console.log(summary.abstractive); // AI-generated summary
```

#### `researchTopic(topic, depth, perspective)`
Research assistant for topic exploration.

**Parameters:**
- `topic` (string): Research topic
- `depth` (string): 'basic'|'medium'|'deep'
- `perspective` (string, optional): Specific perspective

**Example:**
```javascript
const research = await researchTopic(
  "machine learning",
  "deep",
  "focus on practical applications"
);
```

#### `analyzeText(text)`
Comprehensive text analysis.

**Returns:**
```javascript
{
  analysis: "detailed analysis text",
  wordCount: 150,
  characterCount: 750
}
```

#### `getStyleSuggestions(text, target)`
Writing style improvement suggestions.

**Target Styles:**
- `academic` - Formal academic writing
- `business` - Professional communication
- `creative` - Creative and engaging
- `technical` - Technical documentation
- `general` - General writing

### Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const result = await generateContent(prompt);
  // Handle success
} catch (error) {
  console.error('LM Studio error:', error.message);
  // Handle error (show user-friendly message)
}
```

### Troubleshooting

**Common Issues:**

1. **Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:1234
```
- Verify LM Studio is running
- Check server is started in LM Studio
- Confirm port 1234 is correct

2. **Model Not Loaded**
```
Error: Model not found
```
- Load a model in LM Studio
- Wait for model loading to complete
- Check model compatibility

3. **Timeout Errors**
- Increase timeout in axios configuration
- Try smaller prompts
- Use a faster model

## Math Service (`bardService.js`)

### Overview
Specialized service for mathematical content generation and assistance.

### Functions

#### `generateMathContent(prompt, context, options)`
Math-specific content generation with specialized formatting.

#### `getSolution(problem, level)`
Step-by-step solution for math problems.

**Levels:**
- `basic` - Simple explanations
- `medium` - Intermediate detail
- `advanced` - Comprehensive explanations

#### `explainMathConcept(concept, level)`
Mathematical concept explanations.

#### `describeMathVisualization(concept)`
Visualization descriptions for math concepts.

## API Service (`api.js`)

### Overview
Core API configuration and authentication handling.

### Configuration
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';
```

### Functions

#### `apiRequest(method, endpoint, data, options)`
Base API request function with authentication.

#### `get(endpoint, options)`
GET request wrapper.

#### `post(endpoint, data, options)`
POST request wrapper.

#### `put(endpoint, data, options)`
PUT request wrapper.

#### `delete(endpoint, options)`
DELETE request wrapper.

## Socket Service (`socketService.js`)

### Overview
Real-time communication for collaboration features.

### Events

#### Outgoing Events
- `join-note` - Join note editing session
- `leave-note` - Leave note editing session
- `note-update` - Send note updates
- `cursor-position` - Share cursor position

#### Incoming Events
- `note-updated` - Receive note updates
- `user-joined` - User joined session
- `user-left` - User left session
- `cursor-moved` - Other user's cursor moved

## Best Practices

### Service Usage

1. **Always handle errors gracefully**
```javascript
try {
  const result = await serviceFunction();
  // Handle success
} catch (error) {
  // Show user-friendly error message
  showErrorToast('Something went wrong. Please try again.');
}
```

2. **Use loading states**
```javascript
const [loading, setLoading] = useState(false);

const handleAIRequest = async () => {
  setLoading(true);
  try {
    const result = await generateContent(prompt);
    // Handle result
  } finally {
    setLoading(false);
  }
};
```

3. **Implement timeouts for AI requests**
```javascript
const options = {
  timeout: 30000, // 30 seconds
  maxTokens: 1000
};
```

4. **Cache responses when appropriate**
```javascript
const cache = new Map();

const getCachedResult = async (key, generator) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await generator();
  cache.set(key, result);
  return result;
};
```

### Performance Optimization

1. **Debounce AI requests**
```javascript
import { debounce } from 'lodash';

const debouncedAnalysis = debounce(analyzeText, 1000);
```

2. **Use appropriate model settings**
```javascript
// For quick responses
const quickOptions = { temperature: 0.3, maxTokens: 200 };

// For creative content
const creativeOptions = { temperature: 0.8, maxTokens: 1000 };
```

3. **Implement request cancellation**
```javascript
const abortController = new AbortController();

const request = fetch(url, {
  signal: abortController.signal
});

// Cancel request when component unmounts
useEffect(() => {
  return () => abortController.abort();
}, []);
```

## Testing

### Unit Tests
```javascript
// Example test for lmStudioService
import { generateContent } from './lmStudioService';

jest.mock('axios');

test('generates content successfully', async () => {
  const mockResponse = {
    data: {
      choices: [{ message: { content: 'Generated text' } }]
    }
  };
  
  axios.post.mockResolvedValue(mockResponse);
  
  const result = await generateContent('test prompt');
  expect(result.content).toBe('Generated text');
});
```

### Integration Tests
```javascript
// Test with actual LM Studio instance
test('LM Studio integration', async () => {
  // Requires LM Studio to be running
  const result = await generateContent('Hello world');
  expect(result.content).toBeDefined();
});
```

## Environment Configuration

### Development
```env
VITE_LM_STUDIO_URL=http://127.0.0.1:1234
VITE_API_URL=http://localhost:5000
VITE_ENABLE_AI_FEATURES=true
```

### Production
```env
VITE_LM_STUDIO_URL=http://your-lm-studio-server:1234
VITE_API_URL=https://your-api-server.com
VITE_ENABLE_AI_FEATURES=true
```

## Migration from Gemini

If migrating from Gemini AI to LM Studio:

1. Replace `geminiService` imports with `lmStudioService`
2. Update function calls (API format differences handled internally)
3. Remove API key requirements
4. Update error handling for local server issues

### Migration Example
```javascript
// Before (Gemini)
import { chatWithGemini } from './geminiService';
const response = await chatWithGemini(messages);

// After (LM Studio)
import { chatWithLMStudio } from './lmStudioService';
const response = await chatWithLMStudio(messages);
```

## Contributing

When adding new services:

1. Follow the established patterns
2. Include comprehensive error handling
3. Add JSDoc comments
4. Write unit tests
5. Update this documentation

---

For more information about specific services, see the individual service files or the main application README. 