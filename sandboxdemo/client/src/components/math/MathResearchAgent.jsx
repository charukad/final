import React, { useState } from 'react';
import { generateContent } from '../../services/lmStudioService';

const MathResearchAgent = ({ isOpen, currentNote, onClose, onAddToNote }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState('papers'); // papers, formulas, concepts, proofs

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      let prompt = '';
      switch (searchMethod) {
        case 'papers':
          prompt = `Find relevant research papers about: ${query}. Include paper titles, authors, and key findings.`;
          break;
        case 'formulas':
          prompt = `Explain the mathematical formulas and equations related to: ${query}. Include derivations and applications.`;
          break;
        case 'concepts':
          prompt = `Explain the mathematical concepts and theories related to: ${query}. Include historical context and modern applications.`;
          break;
        case 'proofs':
          prompt = `Provide mathematical proofs and derivations related to: ${query}. Include step-by-step explanations.`;
          break;
        default:
          prompt = `Research and explain: ${query}`;
      }

      const result = await generateContent(prompt);
      setResults(result.content);
    } catch (error) {
      console.error('Error in math research:', error);
      setResults('Error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add results to note
  const handleAddToNote = () => {
    if (results && onAddToNote) {
      onAddToNote(results);
    }
  };

  return (
    <div className="math-research-agent-panel" style={{
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
      <div className="math-research-agent-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(to right, #e0f0ff, #d2e3fc)',
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#1a73e8',
          fontWeight: 600,
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>∑</span> Math Research
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
      
      <div className="search-methods" style={{
        display: 'flex',
        padding: '10px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
      }}>
        <button 
          className={`method-button ${searchMethod === 'papers' ? 'active' : ''}`}
          onClick={() => setSearchMethod('papers')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: searchMethod === 'papers' ? '#1a73e8' : '#f5f5f5',
            color: searchMethod === 'papers' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: searchMethod === 'papers' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Papers
        </button>
        <button 
          className={`method-button ${searchMethod === 'formulas' ? 'active' : ''}`}
          onClick={() => setSearchMethod('formulas')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: searchMethod === 'formulas' ? '#1a73e8' : '#f5f5f5',
            color: searchMethod === 'formulas' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: searchMethod === 'formulas' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Formulas
        </button>
        <button 
          className={`method-button ${searchMethod === 'concepts' ? 'active' : ''}`}
          onClick={() => setSearchMethod('concepts')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: searchMethod === 'concepts' ? '#1a73e8' : '#f5f5f5',
            color: searchMethod === 'concepts' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: searchMethod === 'concepts' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Concepts
        </button>
        <button 
          className={`method-button ${searchMethod === 'proofs' ? 'active' : ''}`}
          onClick={() => setSearchMethod('proofs')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '4px',
            margin: '0 5px',
            background: searchMethod === 'proofs' ? '#1a73e8' : '#f5f5f5',
            color: searchMethod === 'proofs' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: searchMethod === 'proofs' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Proofs
        </button>
      </div>
      
      <div className="math-research-content" style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
      }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="math-research-query" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#555'
            }}>
              Enter your mathematical query:
            </label>
            <input
              id="math-research-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., eigenvalues, differential equations, Fourier transform..."
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
              backgroundColor: '#1a73e8',
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
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: 'center', padding: '15px' }}>
            <div style={{ 
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #1a73e8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '10px', color: '#666' }}>Searching mathematical resources...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {results && (
          <div>
            <div
              className="math-research-results"
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f5f9ff',
                borderRadius: '6px',
                border: '1px solid #d2e3fc',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {results}
            </div>
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
        <span>Math Research</span>
        <span>Powered by LM Studio</span>
      </div>
    </div>
  );
};

export default MathResearchAgent; 