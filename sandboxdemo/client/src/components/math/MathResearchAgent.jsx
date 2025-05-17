import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MathResearchAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState('papers'); // papers, formulas, concepts, proofs

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyDrjYMSPjKMhLBs6S0HqkpTTFoVOem4cME');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      const result = await model.generateContent({
        contents: [{
          parts: [{ text: prompt }]
        }]
      });
      
      const response = await result.response;
      setResults(response.text());
    } catch (error) {
      console.error('Error in math research:', error);
      setResults('Error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="math-research-agent">
      <button 
        className="math-research-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔬 Math Research
      </button>

      {isOpen && (
        <div className="math-research-panel">
          <div className="search-methods">
            <button 
              className={searchMethod === 'papers' ? 'active' : ''} 
              onClick={() => setSearchMethod('papers')}
            >
              Research Papers
            </button>
            <button 
              className={searchMethod === 'formulas' ? 'active' : ''} 
              onClick={() => setSearchMethod('formulas')}
            >
              Formulas
            </button>
            <button 
              className={searchMethod === 'concepts' ? 'active' : ''} 
              onClick={() => setSearchMethod('concepts')}
            >
              Concepts
            </button>
            <button 
              className={searchMethod === 'proofs' ? 'active' : ''} 
              onClick={() => setSearchMethod('proofs')}
            >
              Proofs
            </button>
          </div>

          <div className="search-input">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your mathematical query..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {results && (
            <div className="search-results">
              <h3>Results</h3>
              <div className="results-content">
                {results}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MathResearchAgent; 