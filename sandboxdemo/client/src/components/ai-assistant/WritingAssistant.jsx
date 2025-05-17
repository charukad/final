import React, { useState, useEffect } from "react";
import {
  checkGrammarAndSpelling,
  getStyleSuggestions,
} from "../../services/aiService";

const WritingAssistant = ({ content, onSuggest }) => {
  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [styleSuggestions, setStyleSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState("grammar");
  const [styleType, setStyleType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check grammar and style when content changes
  useEffect(() => {
    if (!content) return;

    const checkWriting = async () => {
      setLoading(true);
      try {
        // Check grammar and spelling
        const grammarOptions = {
          checkSpelling: true,
          checkGrammar: true,
          checkStyle: false,
        };

        const grammarResult = await checkGrammarAndSpelling(
          content,
          grammarOptions
        );
        setGrammarSuggestions(grammarResult.suggestions || []);

        // Check style (if enough content)
        if (content.length > 50) {
          const styleResult = await getStyleSuggestions(content, styleType);
          setStyleSuggestions(styleResult.suggestions || []);
        }
      } catch (error) {
        console.error("Error checking writing:", error);
        setError("Failed to analyze your writing. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    checkWriting();
  }, [content, styleType]);

  // Handle style type change
  const handleStyleTypeChange = (e) => {
    setStyleType(e.target.value);
  };

  // Apply a suggestion
  const applySuggestion = (original, suggestion) => {
    if (onSuggest) {
      onSuggest(original, suggestion);
    }
  };

  // Render suggestions based on active tab
  const renderSuggestions = () => {
    const suggestions =
      activeTab === "grammar" ? grammarSuggestions : styleSuggestions;

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing your writing...</p>
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (suggestions.length === 0) {
      return (
        <div className="no-suggestions">
          <p>
            {activeTab === "grammar"
              ? "No grammar or spelling issues found."
              : "No style suggestions at this time."}
          </p>
          <p className="helper-text">
            {activeTab === "grammar"
              ? "Continue writing and we'll check your grammar and spelling."
              : "Add more content for style suggestions."}
          </p>
        </div>
      );
    }

    return (
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item type-${suggestion.type || "style"}`}
          >
            <div className="suggestion-header">
              <span className="suggestion-type">
                {suggestion.type || "Style"}
              </span>
            </div>
            <div className="suggestion-content">
              <div className="original-text">{suggestion.original}</div>
              <div className="suggestion-arrow">↓</div>
              <div className="suggested-text">{suggestion.suggestion}</div>
            </div>
            {suggestion.explanation && (
              <div className="suggestion-explanation">
                {suggestion.explanation || suggestion.reason}
              </div>
            )}
            <div className="suggestion-actions">
              <button
                className="apply-button"
                onClick={() =>
                  applySuggestion(suggestion.original, suggestion.suggestion)
                }
              >
                Apply
              </button>
              <button
                className="dismiss-button"
                onClick={() => {
                  // Remove this suggestion from the list
                  if (activeTab === "grammar") {
                    setGrammarSuggestions((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  } else {
                    setStyleSuggestions((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="writing-assistant">
      <div className="writing-tabs">
        <button
          className={`writing-tab ${activeTab === "grammar" ? "active" : ""}`}
          onClick={() => setActiveTab("grammar")}
        >
          Grammar & Spelling
        </button>
        <button
          className={`writing-tab ${activeTab === "style" ? "active" : ""}`}
          onClick={() => setActiveTab("style")}
        >
          Style Suggestions
        </button>
      </div>

      {activeTab === "style" && (
        <div className="style-selector">
          <label htmlFor="style-type">Writing Style:</label>
          <select
            id="style-type"
            value={styleType}
            onChange={handleStyleTypeChange}
          >
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="business">Business</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="casual">Casual</option>
          </select>
        </div>
      )}

      {renderSuggestions()}
    </div>
  );
};

export default WritingAssistant;
