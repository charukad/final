# Server Controllers

Backend API controllers for the NoteFlow+ application.

## aiController.js

Main controller handling AI-powered features using LM Studio.

### Overview
Provides REST API endpoints for all AI functionality including content generation, grammar checking, text analysis, and research assistance.

### Configuration
```javascript
const LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
const DEFAULT_MODEL = 'local-model';
```

### API Endpoints

#### Content Generation
```
POST /api/ai/generate
Body: { context, prompt, temperature, maxTokens }
Response: { content, usage }
```

#### Grammar & Spelling Check
```
POST /api/ai/grammar-check
Body: { text, checkSpelling, checkGrammar, checkStyle }
Response: { suggestions }
```

#### Text Summarization
```
POST /api/ai/summarize
Body: { text, ratio }
Response: { abstractive, originalLength, summaryLength, compressionRatio }
```

#### Research Assistant
```
POST /api/ai/research
Body: { topic, depth, perspective }
Response: { research, topic }
```

#### Text Analysis
```
POST /api/ai/analyze
Body: { text }
Response: { analysis, metrics, entities, sentiment }
```

#### Style Suggestions
```
POST /api/ai/style-suggestions
Body: { text, target }
Response: { suggestions, targetStyle }
```

### Core Functions

#### generateLMStudioContent()
Main function for LM Studio API communication.

```javascript
const generateLMStudioContent = async (prompt, temperature = 0.7, maxTokens = 1000) => {
  const response = await lmStudioApi.post('/chat/completions', {
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    top_p: 0.95,
    stream: false
  });
  
  return response.data.choices[0].message.content;
};
```

#### isLMStudioAvailable()
Health check for LM Studio connectivity.

### Error Handling
- Connection error handling for LM Studio
- Graceful fallback to local NLP libraries
- Comprehensive error logging
- User-friendly error messages

### Usage Examples

**Content Generation**:
```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write about artificial intelligence',
    temperature: 0.7,
    maxTokens: 500
  })
});
```

**Grammar Check**:
```javascript
const response = await fetch('/api/ai/grammar-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Your text to analyze',
    checkGrammar: true,
    checkSpelling: true,
    checkStyle: true
  })
});
```

### Configuration
Environment variables in `.env`:
```env
LM_STUDIO_URL=http://127.0.0.1:1234/v1
NODE_ENV=development
```

### Dependencies
- axios (for LM Studio API calls)
- natural (NLP fallback)
- compromise (text processing)
- node-summarizer (extractive summarization)
- sentiment (sentiment analysis)

### Migration from Gemini
All Gemini API calls have been replaced with LM Studio endpoints:
- Changed from Google's API format to OpenAI-compatible format
- Removed API key requirements
- Updated error handling for local server

### Testing
```javascript
// Test LM Studio connection
curl -X GET http://127.0.0.1:1234/v1/models

// Test content generation
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world"}'
```

### Troubleshooting
- Ensure LM Studio is running on port 1234
- Check model is loaded in LM Studio
- Verify network connectivity
- Review server logs for detailed errors 