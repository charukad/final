import React, { useState, useEffect } from 'react';

// This would normally connect to a real research service
const simulateResearchRequest = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock research results
  return {
    success: true,
    content: `
      <div style="padding: 15px; background-color: #fff9e6; border-radius: 6px; border-left: 4px solid #f9ab00; margin-bottom: 15px;">
        <h3 style="color: #f9ab00; margin-top: 0;">Research Results: ${query}</h3>
        
        <h4>Key Findings</h4>
        <ul>
          <li>Found relevant information about "${query}" from multiple sources</li>
          <li>Recent research suggests significant developments in this area</li>
          <li>Several academic papers published in the last year address this topic</li>
        </ul>
        
        <h4>Summary</h4>
        <p>This is a simulated research response about "${query}". In a real implementation, this would contain actual research results, citations, key excerpts from relevant sources, and synthesized information.</p>
        
        <h4>Sources</h4>
        <ol>
          <li>Example Research Journal (2023): "Understanding ${query}"</li>
          <li>Academic Database: 24 related papers found</li>
          <li>Recent news articles: 7 relevant mentions in the past month</li>
        </ol>
      </div>
    `
  };
};

const ResearchAgent = ({ isOpen, currentNote, onClose, onAddToNote }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('search'); // search, analyze, summarize, cite

  useEffect(() => {
    if (isOpen && currentNote) {
      console.log('ResearchAgent: Note content updated');
    }
  }, [isOpen, currentNote]);

  // Analyze the current note content
  const analyzeCurrentNote = async () => {
    if (!currentNote || !currentNote.content) {
      setError('No note content to analyze');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would send the note content to a research service
      // For now, we'll simulate a research response
      const result = await simulateResearchRequest("Research topics in note");
      
      setResponse(result.content);
    } catch (err) {
      console.error('Research service error:', err);
      setError(err.message || 'Failed to analyze note content');
    } finally {
      setLoading(false);
    }
  };

  // Run analysis when mode changes to 'analyze'
  useEffect(() => {
    if (mode === 'analyze' && currentNote) {
      analyzeCurrentNote();
    }
  }, [mode, currentNote]);

  // Handle form submission
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
      // In a real implementation, call the actual research service with mode-specific logic
      const result = await simulateResearchRequest(query);
      setResponse(result.content);
    } catch (err) {
      console.error('Research service error:', err);
      setError(err.message || 'Failed to get research results');
    } finally {
      setLoading(false);
    }
  };

  // Add research results to the note
  const handleAddToNote = () => {
    if (response && onAddToNote) {
      onAddToNote(response);
    }
  };

  return (
    <div className="research-agent-panel" style={{
      position: 'fixed',
      top: '68px', // Match the header height
      right: isOpen ? '0' : '-400px',
      width: '400px',
      height: 'calc(100vh - 68px)',
      backgroundColor: '#fff',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
      zIndex: 100,
      transition: 'right 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderLeft: '1px solid #e0e0e0'
    }}>
      <div className="research-agent-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(to right, #fff9e6, #fef7e0)',
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#f9ab00',
          fontWeight: 600,
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🔍</span> Research Agent
        </h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
      </div>
      
      <div className="mode-selector" style={{
        display: 'flex',
        padding: '10px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
      }}>
        <button 
          className={`mode-button ${mode === 'search' ? 'active' : ''}`}
          onClick={() => setMode('search')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: mode === 'search' ? '#f9ab00' : '#f5f5f5',
            color: mode === 'search' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: mode === 'search' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Search
        </button>
        <button 
          className={`mode-button ${mode === 'summarize' ? 'active' : ''}`}
          onClick={() => setMode('summarize')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: mode === 'summarize' ? '#f9ab00' : '#f5f5f5',
            color: mode === 'summarize' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: mode === 'summarize' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Summarize
        </button>
        <button 
          className={`mode-button ${mode === 'cite' ? 'active' : ''}`}
          onClick={() => setMode('cite')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: mode === 'cite' ? '#f9ab00' : '#f5f5f5',
            color: mode === 'cite' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: mode === 'cite' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Cite
        </button>
        <button 
          className={`mode-button ${mode === 'analyze' ? 'active' : ''}`}
          onClick={() => setMode('analyze')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: mode === 'analyze' ? '#f9ab00' : '#f5f5f5',
            color: mode === 'analyze' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: mode === 'analyze' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Analyze
        </button>
      </div>
      
      <div className="research-content" style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
      }}>
        {mode === 'analyze' ? (
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              backgroundColor: '#fff9e6',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '10px',
              border: '1px solid #ffecb3'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f9ab00' }}>Note Analysis</p>
              <p style={{ margin: '0 0 5px 0' }}>
                This mode analyzes your current note to find research topics and suggest relevant information.
              </p>
              {loading && (
                <div style={{ textAlign: 'center', padding: '15px' }}>
                  <div style={{ 
                    display: 'inline-block',
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #f9ab00',
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
                    backgroundColor: '#f9ab00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Analyze Note Content
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="research-query" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#555'
              }}>
                {mode === 'search' && "What would you like to research?"}
                {mode === 'summarize' && "What topic would you like summarized?"}
                {mode === 'cite' && "Find citations for which topic?"}
              </label>
              <input
                id="research-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Enter your ${mode} query...`}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f9ab00',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontWeight: '500',
                width: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? 'Researching...' : 'Research'}
            </button>
          </form>
        )}

        {loading && mode !== 'analyze' && (
          <div style={{ textAlign: 'center', padding: '15px' }}>
            <div style={{ 
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #f9ab00',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '10px', color: '#666' }}>Researching...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            {error}
          </div>
        )}

        {response && (
          <div>
            <div
              className="research-response"
              dangerouslySetInnerHTML={{ __html: response }}
              style={{
                marginTop: '20px',
                borderRadius: '6px',
                overflowX: 'auto'
              }}
            />
            <button
              onClick={handleAddToNote}
              style={{
                display: 'block',
                marginTop: '15px',
                padding: '10px 15px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Add to Note
            </button>
          </div>
        )}
      </div>
      
      <div className="panel-footer" style={{
        padding: '12px 20px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#888',
        fontSize: '12px'
      }}>
        <span>Research Agent</span>
        <span>Powered by Academic Search</span>
      </div>
    </div>
  );
};

export default ResearchAgent; 