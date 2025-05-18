// Simple proxy server to handle visualization requests with longer timeouts
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Proxy endpoint for visualization requests
app.post('/proxy/visualization', async (req, res) => {
  try {
    const vizType = req.body.viz_type || 'auto';
    console.log(`Received visualization request of type: ${vizType}`);
    
    // Make request to the NLP visualization endpoint with a longer timeout
    const response = await axios.post(
      'http://localhost:8000/nlp-visualization',
      {
        prompt: req.body.prompt,
        viz_type: vizType // Ensure visualization type is passed correctly
      },
      { timeout: 300000 } // 5 minute timeout
    );
    
    console.log(`Visualization request successful for type: ${vizType}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error in visualization request:', error.message);
    
    // If it's a timeout but we know visualizations are still being created
    if (error.code === 'ECONNABORTED') {
      // Try to fetch the latest visualization
      try {
        console.log('Timeout occurred, fetching latest visualization');
        const latestResponse = await axios.get(
          'http://localhost:8000/nlp-visualization/latest',
          { timeout: 5000 }
        );
        
        if (latestResponse.data && latestResponse.data.success) {
          console.log(`Retrieved latest visualization of type: ${latestResponse.data.visualization_type}`);
          return res.json({
            success: true,
            file_path: latestResponse.data.file_path,
            message: 'Retrieved latest visualization after timeout',
            visualization_type: latestResponse.data.visualization_type
          });
        }
      } catch (latestError) {
        console.error('Error fetching latest visualization:', latestError.message);
      }
    }
    
    // Return error response
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Direct access to multimodal central process endpoint
app.post('/proxy/multimodal', async (req, res) => {
  try {
    console.log('Received multimodal request');
    
    // Make request to the multimodal central process endpoint
    const response = await axios.post(
      'http://localhost:8000/multimodal/central/process',
      req.body,
      { timeout: 120000 } // 2 minute timeout
    );
    
    console.log('Multimodal request successful');
    res.json(response.data);
  } catch (error) {
    console.error('Error in multimodal request:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get latest visualization
app.get('/proxy/latest', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/nlp-visualization/latest');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve static files from the server's static directory
app.get('/proxy/static/:path(*)', async (req, res) => {
  const path = req.params.path;
  try {
    const response = await axios.get(`http://localhost:8000/static/${path}`, {
      responseType: 'stream'
    });
    
    // Set appropriate content type
    res.set('Content-Type', response.headers['content-type']);
    
    // Pipe the file stream to the response
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send(`Error fetching file: ${error.message}`);
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Visualization proxy server running at http://localhost:${port}`);
}); 