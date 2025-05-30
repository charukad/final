# AI Assistant Components

This directory contains React components for AI-powered features integrated with LM Studio.

## Component Overview

```
ai-assistant/
├── AIChat.jsx              # Main AI chat interface
├── LMStudioTest.jsx        # LM Studio API testing component
└── README.md              # This file
```

## AIChat Component (`AIChat.jsx`)

### Overview
The main AI chat interface that provides an interactive assistant for users while they work on their notes.

### Features
- **Conversational Interface** - Natural chat with AI assistant
- **Context Awareness** - Uses current note content as context
- **Message History** - Maintains conversation history
- **Auto-scroll** - Automatically scrolls to new messages
- **Add to Note** - Insert AI responses directly into notes
- **Identity Management** - AI identifies as "NoteFlow+"

### Props

```javascript
interface AIChatProps {
  content?: string;           // Current note content for context
  onAddToNote?: (text: string) => void;  // Callback to add text to note
}
```

### Usage

```jsx
import AIChat from './components/ai-assistant/AIChat';

function EditorPage() {
  const [noteContent, setNoteContent] = useState('');

  const handleAddToNote = (text) => {
    setNoteContent(prev => prev + '\n\n' + text);
  };

  return (
    <div className="editor-layout">
      <div className="note-editor">
        <textarea 
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
      </div>
      <div className="ai-sidebar">
        <AIChat 
          content={noteContent}
          onAddToNote={handleAddToNote}
        />
      </div>
    </div>
  );
}
```

### State Management

```javascript
const [messages, setMessages] = useState([
  {
    role: "assistant",
    content: "Hello! I'm NoteFlow+, your AI writing assistant. How can I help with your note?"
  }
]);
const [inputMessage, setInputMessage] = useState("");
const [loading, setLoading] = useState(false);
```

### Key Features

#### Smart Identity Responses
The component includes built-in responses for identity questions:

```javascript
const identityQuestions = [
  'what is your name?',
  'who are you?', 
  'what should i call you?',
  "what's your name?"
];

// Provides direct response without API call
if (identityQuestions.includes(lowercaseContent)) {
  setMessages(prev => [...prev, { 
    role: "assistant", 
    content: "My name is NoteFlow+. I'm your AI writing assistant. How can I help you with your note today?" 
  }]);
}
```

#### Context Integration
Automatically includes note content as context:

```javascript
const messageHistory = [...messages, userMessage];
const response = await chatWithLMStudio(messageHistory, content);
```

#### Message Formatting
Handles multi-line responses with proper formatting:

```jsx
<div className="message-content">
  {message.content
    .split("\n")
    .map((line, i) =>
      line ? <p key={i}>{line}</p> : <br key={i} />
    )}
</div>
```

### Styling Classes

```css
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin-bottom: 15px;
}

.message.user {
  /* User message styles */
}

.message.assistant {
  /* Assistant message styles */
}

.add-to-note-button {
  /* Button to add response to note */
}

.chat-input-area {
  padding: 15px;
  border-top: 1px solid #eee;
}

.typing-indicator {
  /* Loading animation */
}
```

## LMStudioTest Component (`LMStudioTest.jsx`)

### Overview
Testing component for verifying LM Studio API connectivity and functionality.

### Features
- **Connection Testing** - Test LM Studio server connectivity
- **Response Testing** - Test AI response generation
- **Identity Testing** - Verify AI identity responses
- **Error Display** - Show detailed error information
- **Response Display** - Format and display AI responses

### Usage

```jsx
import LMStudioTest from './components/ai-assistant/LMStudioTest';

// Access via route: /lmstudio-test
function App() {
  return (
    <Routes>
      <Route path="/lmstudio-test" element={<LMStudioTest />} />
    </Routes>
  );
}
```

### State Management

```javascript
const [prompt, setPrompt] = useState('');
const [response, setResponse] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### Test Functions

#### Manual Testing
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!prompt.trim()) return;

  setLoading(true);
  setError('');
  
  try {
    const result = await generateContent(prompt);
    setResponse(result.content);
  } catch (err) {
    setError(err.message || 'Failed to get response from LM Studio API');
  } finally {
    setLoading(false);
  }
};
```

#### Quick Identity Test
```javascript
const handleQuickTest = async () => {
  setLoading(true);
  setError('');
  
  try {
    const result = await generateContent('What is your name?');
    setResponse(result.content);
  } catch (err) {
    setError(err.message || 'Failed to get response from LM Studio API');
  } finally {
    setLoading(false);
  }
};
```

### Error Handling

The component provides detailed error information for debugging:

```jsx
{error && (
  <div className="error-display">
    <h3>Error:</h3>
    <p style={{ color: 'red' }}>{error}</p>
    
    <h4>Troubleshooting:</h4>
    <ul>
      <li>Ensure LM Studio is running</li>
      <li>Check that a model is loaded</li>
      <li>Verify server is started on port 1234</li>
    </ul>
  </div>
)}
```

## Common Patterns

### Error Handling Pattern
```javascript
const handleAIRequest = async (requestFunction) => {
  setLoading(true);
  setError('');
  
  try {
    const result = await requestFunction();
    // Handle success
    return result;
  } catch (err) {
    console.error('AI request error:', err);
    setError(err.message || 'Something went wrong');
    
    // Show user-friendly error
    if (err.code === 'ECONNREFUSED') {
      setError('Cannot connect to LM Studio. Please check if it\'s running.');
    }
  } finally {
    setLoading(false);
  }
};
```

### Loading State Pattern
```jsx
{loading && (
  <div className="loading-indicator">
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p>AI is thinking...</p>
  </div>
)}
```

### Message Display Pattern
```jsx
{messages.map((message, index) => (
  <div key={index} className={`message ${message.role}`}>
    <div className="message-content">
      {message.content.split("\n").map((line, i) =>
        line ? <p key={i}>{line}</p> : <br key={i} />
      )}
    </div>
    
    {message.role === "assistant" && (
      <button
        className="add-to-note-button"
        onClick={() => onAddToNote(message.content)}
        title="Add to note"
      >
        +
      </button>
    )}
  </div>
))}
```

## Customization

### Adding New AI Features

1. **Create new component**:
```jsx
// GrammarChecker.jsx
import { checkGrammarAndSpelling } from '../../services/lmStudioService';

export default function GrammarChecker({ text, onSuggestions }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkGrammar = async () => {
    setLoading(true);
    try {
      const result = await checkGrammarAndSpelling(text);
      setSuggestions(result.suggestions);
      onSuggestions(result.suggestions);
    } catch (error) {
      console.error('Grammar check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grammar-checker">
      <button onClick={checkGrammar} disabled={loading}>
        {loading ? 'Checking...' : 'Check Grammar'}
      </button>
      
      {suggestions.map((suggestion, index) => (
        <div key={index} className="suggestion">
          <strong>{suggestion.type}:</strong> {suggestion.original}
          <br />
          <em>Suggestion:</em> {suggestion.suggestion}
        </div>
      ))}
    </div>
  );
}
```

2. **Integrate with main interface**:
```jsx
// In your main editor component
import GrammarChecker from './ai-assistant/GrammarChecker';

<GrammarChecker 
  text={selectedText} 
  onSuggestions={handleGrammarSuggestions}
/>
```

### Styling Customization

```css
/* Custom AI assistant theme */
.ai-chat {
  --ai-primary-color: #1a73e8;
  --ai-secondary-color: #f0f8ff;
  --ai-text-color: #333;
  --ai-border-color: #e0e0e0;
}

.message.assistant {
  background: var(--ai-secondary-color);
  border-left: 3px solid var(--ai-primary-color);
}

.message.user {
  background: #f5f5f5;
  text-align: right;
}
```

## Performance Considerations

### Optimizations

1. **Debounced requests**:
```javascript
import { useDebounce } from 'use-debounce';

const [debouncedText] = useDebounce(inputText, 1000);

useEffect(() => {
  if (debouncedText) {
    analyzeText(debouncedText);
  }
}, [debouncedText]);
```

2. **Memoized components**:
```javascript
const MessageComponent = React.memo(({ message }) => (
  <div className={`message ${message.role}`}>
    {message.content}
  </div>
));
```

3. **Virtual scrolling for long conversations**:
```javascript
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={messages.length}
  itemSize={80}
  itemData={messages}
>
  {MessageRow}
</List>
```

## Testing

### Component Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import AIChat from './AIChat';

test('renders initial assistant message', () => {
  render(<AIChat />);
  expect(screen.getByText(/Hello! I'm NoteFlow+/)).toBeInTheDocument();
});

test('handles user input', async () => {
  const mockAddToNote = jest.fn();
  render(<AIChat onAddToNote={mockAddToNote} />);
  
  const input = screen.getByPlaceholderText(/Ask me anything/);
  fireEvent.change(input, { target: { value: 'Hello AI' } });
  fireEvent.click(screen.getByText('Send'));
  
  expect(screen.getByText('Hello AI')).toBeInTheDocument();
});
```

### Integration Tests
```javascript
test('AI chat integration with LM Studio', async () => {
  // Mock LM Studio service
  jest.mock('../../services/lmStudioService', () => ({
    chatWithLMStudio: jest.fn().mockResolvedValue({
      content: 'Hello! How can I help you?'
    })
  }));

  render(<AIChat />);
  
  // Test interaction
  const input = screen.getByPlaceholderText(/Ask me anything/);
  fireEvent.change(input, { target: { value: 'Test message' } });
  fireEvent.click(screen.getByText('Send'));
  
  await waitFor(() => {
    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Component not rendering**:
   - Check LM Studio service import
   - Verify component exports
   - Check for JavaScript errors in console

2. **AI responses not working**:
   - Verify LM Studio is running
   - Check network connectivity
   - Review browser console for errors

3. **Styling issues**:
   - Ensure CSS files are imported
   - Check for conflicting styles
   - Verify CSS class names match

### Debugging Tips

```javascript
// Add debug logging
useEffect(() => {
  console.log('AIChat mounted with props:', { content, onAddToNote });
}, [content, onAddToNote]);

// Log AI requests
const handleSendMessage = async () => {
  console.log('Sending message:', inputMessage);
  console.log('Current messages:', messages);
  
  try {
    const response = await chatWithLMStudio(messageHistory, content);
    console.log('AI response:', response);
  } catch (error) {
    console.error('AI request failed:', error);
  }
};
```

---

For more information about the services these components use, see the [Services README](../services/README.md). 