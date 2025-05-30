# FinalRepo
# FinalRepo
# FinalRepo

# NoteFlow+ with LM Studio Integration

A comprehensive note-taking application with integrated AI assistance powered by LM Studio for local AI inference.

## Overview

NoteFlow+ is a full-stack note-taking application that provides intelligent writing assistance, grammar checking, text summarization, research capabilities, and more through a locally-hosted AI model using LM Studio.

## Architecture

```
project/
├── sandboxdemo/
│   ├── client/          # React frontend application
│   ├── server/          # Node.js backend API
│   └── README.md        # Detailed setup guide
├── llm/                 # LLM-related utilities
├── models/              # AI model storage
└── visualizations/      # Data visualization components
```

## AI Integration Features

### 🤖 Local AI with LM Studio
- **No external API dependencies** - All AI functionality runs locally
- **Privacy-focused** - Your data never leaves your machine
- **Cost-effective** - No per-token charges or API limits
- **Customizable** - Use any compatible LLM model

### 🧠 AI Capabilities
- **Intelligent Chat Assistant** - NoteFlow+ AI assistant for writing help
- **Grammar & Spelling Check** - Real-time text analysis and suggestions
- **Text Summarization** - Automatic content summarization
- **Research Assistant** - Topic research and insights
- **Math Research Agent** - Specialized mathematical assistance
- **Style Suggestions** - Writing style improvements
- **Text Analysis** - Comprehensive content analysis

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **LM Studio** - Download from [https://lmstudio.ai/](https://lmstudio.ai/)

### LM Studio Setup
1. Download and install LM Studio
2. Download a compatible model (recommended: Llama 2, Code Llama, or similar)
3. Start the local server in LM Studio:
   - Open LM Studio
   - Go to the "Local Server" tab
   - Load your preferred model
   - Start the server on `http://127.0.0.1:1234`
   - Ensure the server is running before starting the application

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd project
```

### 2. Setup Client
```bash
cd sandboxdemo/client
npm install --legacy-peer-deps
```

### 3. Setup Server
```bash
cd ../server
npm install
```

### 4. Environment Configuration
Create `.env` files in both client and server directories:

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000
VITE_LM_STUDIO_URL=http://127.0.0.1:1234
```

**Server (.env):**
```env
PORT=5000
LM_STUDIO_URL=http://127.0.0.1:1234/v1
NODE_ENV=development
```

### 5. Start Services

**Terminal 1 - Start LM Studio:**
- Open LM Studio application
- Load your preferred model
- Start local server on port 1234

**Terminal 2 - Start Backend:**
```bash
cd sandboxdemo/server
npm run dev
```

**Terminal 3 - Start Frontend:**
```bash
cd sandboxdemo/client
npm run dev
```

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **LM Studio API**: http://127.0.0.1:1234
- **LM Studio Test**: http://localhost:5173/lmstudio-test

## API Endpoints

### AI Services
- `POST /api/ai/generate` - Content generation
- `POST /api/ai/grammar-check` - Grammar and spelling analysis
- `POST /api/ai/summarize` - Text summarization
- `POST /api/ai/research` - Topic research
- `POST /api/ai/analyze` - Text analysis
- `POST /api/ai/style-suggestions` - Writing style improvements

### Notes Management
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Development

### Project Structure
```
sandboxdemo/
├── client/src/
│   ├── components/
│   │   ├── ai-assistant/     # AI chat and assistance components
│   │   ├── math/            # Math research agent
│   │   └── ...
│   ├── services/
│   │   ├── lmStudioService.js   # Main LM Studio integration
│   │   ├── bardService.js       # Math-specific AI service
│   │   └── ...
│   └── pages/              # Main application pages
└── server/src/
    ├── controllers/
    │   ├── aiController.js     # AI endpoint handlers
    │   └── ...
    ├── config/
    │   ├── ai.js              # AI configuration
    │   └── ...
    └── routes/               # API route definitions
```

### Key Configuration Files
- `sandboxdemo/client/src/services/lmStudioService.js` - Frontend AI service
- `sandboxdemo/server/src/controllers/aiController.js` - Backend AI controller
- `sandboxdemo/server/src/config/ai.js` - AI configuration

## Troubleshooting

### Common Issues

**1. LM Studio Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:1234
```
- Ensure LM Studio is running and server is started
- Check that the model is loaded in LM Studio
- Verify the port number (default: 1234)

**2. Model Loading Issues**
- Ensure sufficient RAM for the model
- Try a smaller model if experiencing memory issues
- Check LM Studio logs for model loading errors

**3. API Response Errors**
```
Error: LM Studio API error
```
- Check LM Studio server status
- Verify model compatibility
- Review server logs for detailed error messages

### Performance Optimization
- **Model Selection**: Use quantized models for better performance
- **Memory Management**: Monitor RAM usage, especially with larger models
- **Response Times**: Larger models provide better quality but slower responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with LM Studio integration
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review LM Studio documentation
3. Open an issue in the repository

---

**Note**: This application requires LM Studio to be running locally for AI functionality. Without LM Studio, the app will function as a regular note-taking application without AI features.
