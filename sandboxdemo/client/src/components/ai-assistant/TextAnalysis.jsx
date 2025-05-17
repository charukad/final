import { useState } from "react";
import React from "react";
import { analyzeText } from "../../services/aiService";

const TextAnalysis = ({ content, analysis }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localAnalysis, setAnalysis] = useState(analysis);

  // Update local analysis when prop changes
  React.useEffect(() => {
    setAnalysis(analysis);
  }, [analysis]);

  // Refresh analysis
  const refreshAnalysis = async () => {
    if (!content) return;

    setLoading(true);
    setError("");

    try {
      const newAnalysis = await analyzeText(content);
      setAnalysis(newAnalysis);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setError("Failed to analyze text. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Analyzing text...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button className="retry-button" onClick={refreshAnalysis}>
          Try Again
        </button>
      </div>
    );
  }

  if (!localAnalysis) {
    return (
      <div className="no-analysis">
        <p>No analysis available.</p>
        <button className="analyze-button" onClick={refreshAnalysis}>
          Analyze Text
        </button>
      </div>
    );
  }

  return (
    <div className="text-analysis">
      <div className="analysis-header">
        <h4>Document Analysis</h4>
        <button
          className="refresh-button"
          onClick={refreshAnalysis}
          title="Refresh Analysis"
        >
          ↻
        </button>
      </div>

      <div className="analysis-section">
        <h5>Document Metrics</h5>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{localAnalysis?.metrics?.words || 0}</div>
            <div className="metric-label">Words</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{localAnalysis?.metrics?.characters || 0}</div>
            <div className="metric-label">Characters</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{localAnalysis?.metrics?.sentences || 0}</div>
            <div className="metric-label">Sentences</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{localAnalysis?.metrics?.paragraphs || 0}</div>
            <div className="metric-label">Paragraphs</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{localAnalysis?.metrics?.readTime || 0} min</div>
            <div className="metric-label">Reading Time</div>
          </div>
        </div>
      </div>

      {localAnalysis?.keyTerms && localAnalysis.keyTerms.length > 0 && (
        <div className="analysis-section">
          <h5>Key Terms</h5>
          <div className="key-terms">
            {localAnalysis.keyTerms.map((term, index) => (
              <div
                key={index}
                className="key-term"
                style={{
                  fontSize: `${Math.max(
                    0.8,
                    Math.min(1.6, term.frequency / 10 + 1)
                  )}em`,
                }}
              >
                {term.term}
              </div>
            ))}
          </div>
        </div>
      )}

      {localAnalysis?.sentiment && (
        <div className="analysis-section">
          <h5>Sentiment Analysis</h5>
          <div className="sentiment-meter">
            <div
              className="sentiment-indicator"
              style={{
                left: `${Math.min(
                  100,
                  Math.max(0, ((localAnalysis.sentiment.score || 0) + 5) * 10)
                )}%`,
              }}
            ></div>
            <div className="sentiment-scale">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
          <div className="sentiment-detail">
            <div className="sentiment-item">
              <span className="sentiment-label">Positive terms:</span>
              <span className="sentiment-value">
                {localAnalysis.sentiment.positive?.length || 0}
              </span>
            </div>
            <div className="sentiment-item">
              <span className="sentiment-label">Negative terms:</span>
              <span className="sentiment-value">
                {localAnalysis.sentiment.negative?.length || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {localAnalysis?.entities && 
        (localAnalysis.entities.people?.length > 0 ||
        localAnalysis.entities.places?.length > 0 ||
        localAnalysis.entities.organizations?.length > 0) && (
        <div className="analysis-section">
          <h5>Named Entities</h5>
          <div className="entities-list">
            {localAnalysis.entities.people?.length > 0 && (
              <div className="entity-group">
                <span className="entity-label">People:</span>
                <div className="entity-values">
                  {localAnalysis.entities.people.map((person, index) => (
                    <span key={index} className="entity-value">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {localAnalysis.entities.places?.length > 0 && (
              <div className="entity-group">
                <span className="entity-label">Places:</span>
                <div className="entity-values">
                  {localAnalysis.entities.places.map((place, index) => (
                    <span key={index} className="entity-value">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {localAnalysis.entities.organizations?.length > 0 && (
              <div className="entity-group">
                <span className="entity-label">Organizations:</span>
                <div className="entity-values">
                  {localAnalysis.entities.organizations.map((org, index) => (
                    <span key={index} className="entity-value">
                      {org}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnalysis;
