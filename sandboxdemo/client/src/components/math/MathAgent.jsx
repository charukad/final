import React, { useState, useEffect } from 'react';
import { generateMathContent } from '../../services/bardService';

const MathAgent = ({ isOpen, currentNote, onClose, onAddToNote }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('solve'); // solve, explain, visualize, analyze

  // Get current note content to provide context to the math agent
  useEffect(() => {
    if (isOpen && currentNote) {
      // Extract any math-related content from the note to provide context
      // const noteContent = currentNote.content || '';
      // You could perform additional processing here if needed
      console.log('MathAgent: Note content updated');
    }
  }, [isOpen, currentNote]);

  // Function to analyze the current note
  const analyzeCurrentNote = async () => {
    if (!currentNote || !currentNote.content) {
      setError('No note content to analyze');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const noteContent = currentNote.content;
      
      const prompt = `Analyze the following note for mathematical content. 
      Identify any math problems, equations, or concepts present in the note. 
      If there are math problems, solve them step by step. 
      If there are math concepts, explain them briefly. 
      Provide a summary of all mathematical elements found in the note.
      
      Note content: ${noteContent}`;
      
      const result = await generateMathContent(prompt, null);
      setResponse(result.content);
    } catch (err) {
      console.error('Bard API error:', err);
      setError(err.message || 'Failed to analyze note content');
    } finally {
      setLoading(false);
    }
  };

  // Run the note analysis when the mode is changed to 'analyze'
  useEffect(() => {
    if (mode === 'analyze' && currentNote) {
      analyzeCurrentNote();
    }
  }, [mode, currentNote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'analyze') {
      analyzeCurrentNote();
      return;
    }

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const noteContent = currentNote?.content || '';
      const context = `I'm working on the following note: ${noteContent}`;
      
      // Customize prompt based on selected mode
      let prompt = '';
      switch(mode) {
        case 'solve':
          prompt = `Solve this math problem step by step: ${query}`;
          break;
        case 'explain':
          prompt = `Explain this math concept in detail: ${query}`;
          break;
        case 'visualize':
          prompt = `Describe how to visualize this math concept: ${query}`;
          break;
        default:
          prompt = `Help me with this math question: ${query}`;
      }
      
      const result = await generateMathContent(prompt, context);
      setResponse(result.content);
    } catch (err) {
      console.error('Bard API error:', err);
      setError(err.message || 'Failed to get response from math agent');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToNote = () => {
    if (response && onAddToNote) {
      onAddToNote(response);
    }
  };

  return (
    <div className={`math-agent-panel ${isOpen ? 'open' : ''}`} style={{
      position: 'fixed',
      top: '60px',
      right: isOpen ? '0' : '-400px',
      width: '400px',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#fff',
      boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
      zIndex: 100,
      transition: 'right 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <div className="math-agent-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0 }}>Math Agent</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div className="mode-selector" style={{
        display: 'flex',
        marginBottom: '15px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        flexWrap: 'wrap'
      }}>
        <button 
          className={`mode-button ${mode === 'solve' ? 'active' : ''}`}
          onClick={() => setMode('solve')}
          style={{
            flex: '1 0 25%',
            padding: '8px',
            border: 'none',
            background: mode === 'solve' ? '#4285f4' : '#f1f3f4',
            color: mode === 'solve' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Solve
        </button>
        <button 
          className={`mode-button ${mode === 'explain' ? 'active' : ''}`}
          onClick={() => setMode('explain')}
          style={{
            flex: '1 0 25%',
            padding: '8px',
            border: 'none',
            background: mode === 'explain' ? '#4285f4' : '#f1f3f4',
            color: mode === 'explain' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Explain
        </button>
        <button 
          className={`mode-button ${mode === 'visualize' ? 'active' : ''}`}
          onClick={() => setMode('visualize')}
          style={{
            flex: '1 0 25%',
            padding: '8px',
            border: 'none',
            background: mode === 'visualize' ? '#4285f4' : '#f1f3f4',
            color: mode === 'visualize' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Visualize
        </button>
        <button 
          className={`mode-button ${mode === 'analyze' ? 'active' : ''}`}
          onClick={() => setMode('analyze')}
          style={{
            flex: '1 0 25%',
            padding: '8px',
            border: 'none',
            background: mode === 'analyze' ? '#4285f4' : '#f1f3f4',
            color: mode === 'analyze' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Analyze Note
        </button>
      </div>
      
      {mode === 'analyze' ? (
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            backgroundColor: '#f1f7fe',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '10px',
            border: '1px solid #d1e3fa'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Note Analysis</p>
            <p style={{ margin: '0 0 5px 0' }}>
              This mode analyzes the current note for mathematical content and provides solutions, explanations, and insights.
            </p>
            {loading && (
              <div style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '30px',
                  height: '30px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #4285f4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: '10px', color: '#666' }}>Analyzing note content...</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            {!loading && !response && (
              <button 
                onClick={analyzeCurrentNote}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  width: '100%'
                }}
              >
                Analyze Note Content
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '15px' }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter your math ${mode === 'solve' ? 'problem' : mode === 'explain' ? 'concept' : 'visualization request'}...`}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minHeight: '100px',
              marginBottom: '10px',
              resize: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: '10px 15px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loading || !query.trim() ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      )}
      
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fde7e9',
          color: '#d32f2f',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '10px',
            whiteSpace: 'pre-wrap',
            border: '1px solid #e0e0e0'
          }}>
            {response}
          </div>
          
          <button 
            onClick={handleAddToNote}
            style={{
              padding: '10px 15px',
              backgroundColor: '#0f9d58',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add to Note
          </button>
        </div>
      )}
    </div>
  );
};

export default MathAgent; 