import React, { useState } from 'react';
import { generateContent } from '../../services/geminiService';

const GeminiTest = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await generateContent(prompt);
      setResponse(result.content);
    } catch (err) {
      console.error('Gemini API error:', err);
      setError(err.message || 'Failed to get response from Gemini API');
    } finally {
      setLoading(false);
    }
  };
  
  const testNameResponse = async () => {
    setPrompt('What is your name?');
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateContent('What is your name?');
      setResponse(result.content);
    } catch (err) {
      console.error('Gemini API error:', err);
      setError(err.message || 'Failed to get response from Gemini API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Gemini API Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testNameResponse}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4b0082',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
          disabled={loading}
        >
          Test "What is your name?" Response
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="prompt" style={{ display: 'block', marginBottom: '8px' }}>
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '100px', 
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            placeholder="Type your prompt here..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10a37f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Getting response...' : 'Submit'}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div style={{ marginTop: '30px' }}>
          <h3>Gemini Response:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            whiteSpace: 'pre-wrap'
          }}>
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTest; 