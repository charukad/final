# NoteFlow+ Application

A full-stack note-taking application with AI assistance powered by LM Studio.

## Application Structure

```
sandboxdemo/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API and AI services
│   │   ├── pages/       # Application pages
│   │   ├── contexts/    # React contexts
│   │   └── styles/      # CSS styles
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── server/              # Node.js backend (Express)
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── config/      # Configuration files
│   │   └── utils/       # Utility functions
│   └── package.json     # Backend dependencies
└── README.md           # This file
```

## Features

### Core Functionality
- **Rich Text Editor** - Advanced note editing with formatting
- **Real-time Collaboration** - Multiple users can edit simultaneously
- **File Management** - Organize notes in folders
- **Search & Filter** - Find notes quickly
- **Export Options** - Export notes in various formats
- **Tag System** - Categorize and organize content

### AI-Powered Features
- **AI Chat Assistant** - Interactive writing helper
- **Grammar Checking** - Real-time grammar and spelling analysis
- **Text Summarization** - Automatic content summarization
- **Research Assistant** - Topic research and insights
- **Math Research Agent** - Specialized mathematical assistance
- **Style Suggestions** - Writing improvement recommendations
- **Content Analysis** - Comprehensive text analysis

## Setup Instructions

### Prerequisites
1. **LM Studio** - Download and install from [lmstudio.ai](https://lmstudio.ai/)
2. **Node.js** v16+ and npm
3. **Database** (MongoDB or PostgreSQL - check server configuration)

### 1. LM Studio Configuration

#### Download and Setup
```bash
# 1. Download LM Studio from https://lmstudio.ai/
# 2. Install the application
# 3. Download a compatible model (recommendations below)
```

#### Recommended Models
- **Llama 2 7B** - Good balance of speed and quality
- **Code Llama 7B** - Better for technical content
- **Mistral 7B** - Fast and efficient
- **Llama 2 13B** - Higher quality (requires more RAM)

#### Start LM Studio Server
1. Open LM Studio
2. Go to "Local Server" tab
3. Load your chosen model
4. Configure server settings:
   - Port: `1234` (default)
   - Host: `127.0.0.1`
5. Click "Start Server"
6. Verify server is running at `http://127.0.0.1:1234`

### 2. Backend Setup

```bash
cd sandboxdemo/server
npm install

# Create environment file
cp .env.example .env
```

#### Configure Environment Variables
Edit `server/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=your_database_connection_string
MONGODB_URI=mongodb://localhost:27017/noteflow

# LM Studio Configuration
LM_STUDIO_URL=http://127.0.0.1:1234/v1

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads
```

#### Start Backend Server
```bash
npm run dev
# or
npm start
```

The server will start at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd sandboxdemo/client
npm install --legacy-peer-deps
```

#### Configure Environment Variables
Create `client/.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api

# LM Studio Configuration
VITE_LM_STUDIO_URL=http://127.0.0.1:1234

# Application Configuration
VITE_APP_NAME="NoteFlow+"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
```

#### Start Frontend Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage Guide

### Basic Note Operations

#### Creating Notes
1. Click "New Note" button
2. Enter note title
3. Use the rich text editor for content
4. AI assistant is available in the sidebar

#### AI Assistant Features
- **Chat**: Click the AI icon to open chat
- **Grammar Check**: Use the grammar checker in the toolbar
- **Summarize**: Select text and use summarization tool
- **Research**: Access research agent for topic exploration

#### Math Research Agent
1. Click the Math (∑) button in the toolbar
2. Choose research type:
   - **Papers**: Find research papers
   - **Formulas**: Get formula explanations
   - **Concepts**: Learn mathematical concepts
   - **Proofs**: Get step-by-step proofs
3. Enter your query and search
4. Add results directly to your note

### Advanced Features

#### Collaboration
- Share notes with other users
- Real-time editing with conflict resolution
- Comment system for feedback
- Version history tracking

#### Organization
- Create folders and subfolders
- Tag notes for easy categorization
- Search across all notes
- Filter by date, tags, or folders

#### Export Options
- PDF export with formatting
- Markdown export
- HTML export
- Plain text export

## API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
```

### Notes Endpoints
```
GET    /api/notes            # Get all notes
POST   /api/notes            # Create new note
GET    /api/notes/:id        # Get specific note
PUT    /api/notes/:id        # Update note
DELETE /api/notes/:id        # Delete note
```

### AI Service Endpoints
```
POST /api/ai/generate              # Generate content
POST /api/ai/grammar-check         # Check grammar
POST /api/ai/summarize            # Summarize text
POST /api/ai/research             # Research topics
POST /api/ai/analyze              # Analyze text
POST /api/ai/style-suggestions    # Get style suggestions
POST /api/ai/topic-insights       # Get topic insights
```

### Collaboration Endpoints
```
GET    /api/collaboration/:noteId/users    # Get collaborators
POST   /api/collaboration/:noteId/invite   # Invite user
DELETE /api/collaboration/:noteId/:userId  # Remove user
```

## Troubleshooting

### LM Studio Issues

**Server Not Starting**
```bash
# Check if port 1234 is available
netstat -an | grep 1234

# Try different port in LM Studio settings
# Update VITE_LM_STUDIO_URL accordingly
```

**Model Loading Errors**
- Ensure sufficient RAM (8GB+ recommended)
- Try smaller quantized models
- Check LM Studio logs for detailed errors

**API Connection Issues**
```javascript
// Test connection manually
fetch('http://127.0.0.1:1234/v1/models')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Backend Issues

**Database Connection**
```bash
# Check database status
# For MongoDB:
mongosh
# For PostgreSQL:
psql -U username -d database_name
```

**Port Conflicts**
```bash
# Find process using port 5000
lsof -i :5000
# Kill process if needed
kill -9 <PID>
```

### Frontend Issues

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Development Server Issues**
```bash
# Check if port 5173 is available
netstat -an | grep 5173
```

## Development

### Project Scripts

**Backend:**
```bash
npm run dev          # Development server with hot reload
npm start            # Production server
npm run test         # Run tests
npm run lint         # Lint code
```

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Code Structure

#### Frontend Architecture
- **React 19** with hooks and contexts
- **Vite** for build tooling
- **Axios** for API communication
- **Socket.io** for real-time features
- **React Router** for navigation

#### Backend Architecture
- **Express.js** with RESTful APIs
- **Socket.io** for real-time collaboration
- **JWT** for authentication
- **Mongoose/Sequelize** for database ORM
- **Multer** for file uploads

### Adding New AI Features

1. **Add Service Function** (client/src/services/lmStudioService.js):
```javascript
export const newAIFeature = async (input, options = {}) => {
  try {
    const response = await lmStudioApi.post('/chat/completions', {
      model: 'local-model',
      messages: [{ role: 'user', content: input }],
      ...options
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Feature error:', error);
    throw error;
  }
};
```

2. **Add Backend Controller** (server/src/controllers/aiController.js):
```javascript
exports.newAIFeature = async (req, res) => {
  try {
    const { input } = req.body;
    const result = await generateLMStudioContent(input);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

3. **Add Route** (server/src/routes/aiRoutes.js):
```javascript
router.post('/new-feature', aiController.newAIFeature);
```

## Performance Optimization

### LM Studio Optimization
- Use quantized models for faster inference
- Adjust context length based on needs
- Monitor GPU/CPU usage
- Consider model warming strategies

### Frontend Optimization
- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize API calls with caching
- Implement virtual scrolling for large lists

### Backend Optimization
- Implement API rate limiting
- Use database indexing
- Cache frequent queries
- Optimize file uploads

## Security Considerations

- All AI processing happens locally
- Implement proper authentication
- Validate all user inputs
- Secure file upload handling
- Use HTTPS in production
- Implement CORS properly

## Deployment

### Local Development
Follow the setup instructions above

### Production Deployment
1. Build frontend: `npm run build`
2. Configure production environment variables
3. Set up reverse proxy (nginx recommended)
4. Use process manager (PM2 recommended)
5. Set up database backups
6. Configure monitoring

---

For more information, see the main project README or open an issue in the repository.
