# LM Studio Setup Guide

Complete setup guide for LM Studio integration with NoteFlow+.

## Quick Start

### 1. Download & Install
- Visit [https://lmstudio.ai/](https://lmstudio.ai/)
- Download for your operating system
- Install and launch LM Studio

### 2. Download a Model
**Recommended for most users**: Llama 2 7B Chat (Q4_K_M quantization)

1. Go to "Browse" tab in LM Studio
2. Search for "llama-2-7b-chat"
3. Select Q4_K_M version (good balance of speed/quality)
4. Click Download (may take 30-60 minutes)

### 3. Load Model & Start Server
1. Go to "Chat" tab → Select your downloaded model
2. Wait for model to load (green status indicator)
3. Go to "Local Server" tab
4. Select your model from dropdown
5. Configure settings:
   - Port: `1234`
   - Host: `127.0.0.1` 
   - Enable CORS: Yes
6. Click "Start Server"

### 4. Verify Connection
Test at: `http://127.0.0.1:1234/v1/models`
Should return JSON with model information.

## Model Recommendations

### By System Resources

**8GB RAM**:
- TinyLlama 1.1B Chat
- Phi-2 2.7B
- Llama 2 7B (Q4_K_M)

**16GB RAM**:
- Llama 2 7B (Q8_0)
- Mistral 7B Instruct
- Code Llama 7B
- Llama 2 13B (Q4_K_M)

**32GB+ RAM**:
- Llama 2 13B (Q8_0)
- Code Llama 13B
- Any model at highest quality

### By Use Case

**Academic Writing**: Llama 2 13B Chat
**Creative Writing**: Vicuna 13B  
**Technical Content**: Code Llama 7B/13B
**General Notes**: Llama 2 7B Chat, Mistral 7B

## Configuration

### NoteFlow+ Environment Variables

**Client (.env)**:
```env
VITE_LM_STUDIO_URL=http://127.0.0.1:1234
```

**Server (.env)**:
```env
LM_STUDIO_URL=http://127.0.0.1:1234/v1
```

### LM Studio Server Settings
- **Port**: 1234 (matches NoteFlow+ default)
- **Context Length**: 4096+ tokens
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1000-2000

## Testing Integration

1. Start LM Studio with loaded model and running server
2. Start NoteFlow+ backend: `cd sandboxdemo/server && npm run dev`
3. Start NoteFlow+ frontend: `cd sandboxdemo/client && npm run dev`
4. Visit: `http://localhost:5173/lmstudio-test`
5. Test AI responses

## Troubleshooting

### Connection Issues
**Error: ECONNREFUSED 127.0.0.1:1234**
- Ensure LM Studio server is running (green status)
- Check model is loaded first
- Verify port 1234 is not blocked

**Model Loading Issues**
- Insufficient RAM → Try smaller/quantized model
- Corrupted download → Re-download model
- LM Studio crash → Restart application

**Slow Performance**
- Try smaller model (7B instead of 13B)
- Use higher quantization (Q4_K_M instead of Q8_0)
- Close other memory-intensive apps
- Check CPU/memory usage

### Server Issues
**Port Already in Use**
- Change port in LM Studio settings
- Update VITE_LM_STUDIO_URL accordingly
- Kill process using port: `lsof -ti:1234 | xargs kill -9`

**CORS Errors**
- Enable CORS in LM Studio server settings
- Restart server after enabling

## Performance Tips

### Hardware Optimization
- Close unnecessary applications
- Use SSD for model storage
- Ensure adequate cooling
- Enable GPU acceleration if available

### Model Selection
- Q4_K_M quantization for best balance
- 7B models for speed, 13B+ for quality
- Match model size to available RAM
- Consider use case (creative vs technical)

## Security & Privacy

### Benefits
- Complete data privacy (local processing)
- No API costs or rate limits
- Works offline after setup
- Full control over model and data

### Considerations
- Models process data locally only
- No external network calls during inference
- Consider firewall rules for server port
- Download models from trusted sources

## Advanced Setup

### Multiple Models
1. Download different models for different tasks
2. Switch models based on content type
3. Configure model-specific parameters

### Custom Models
1. Download .gguf format models
2. Place in LM Studio models directory
3. Refresh model list
4. Load and test

### API Integration
LM Studio provides OpenAI-compatible endpoints:
- `/v1/chat/completions` - Main chat API
- `/v1/completions` - Text completion
- `/v1/models` - List available models

## Support Resources

- **LM Studio Docs**: [docs.lmstudio.ai](https://docs.lmstudio.ai)
- **Model Hub**: [huggingface.co](https://huggingface.co)
- **Community**: LM Studio Discord/Reddit
- **NoteFlow+ Issues**: Project repository

---

For application-specific integration, see the main [README](README.md). 