import React, { useState } from "react";
import { summarizeText } from "../../services/aiService";

const Summarizer = ({ content, onAddToNote }) => {
  const [summary, setSummary] = useState(null);
  const [summaryType, setSummaryType] = useState("abstractive");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Map summary length to ratio
  const getLengthRatio = () => {
    switch (summaryLength) {
      case "brief":
        return 0.2;
      case "medium":
        return 0.3;
      case "detailed":
        return 0.5;
      default:
        return 0.3;
    }
  };

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!content || content.length < 100) {
      setError(
        "Content is too short to summarize. Add more text to your note."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ratio = getLengthRatio();
      const result = await summarizeText(content, ratio);
      setSummary(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      setError("Failed to generate summary. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add summary to note
  const handleAddToNote = () => {
    if (!summary) return;

    let summaryText;
    if (summaryType === "abstractive") {
      summaryText = `## Summary\n\n${summary.abstractive}`;
    } else {
      summaryText = `## Summary\n\n${summary.extractive.sentences.join(" ")}`;
    }

    if (onAddToNote) {
      onAddToNote(summaryText);
    }
  };

  return (
    <div className="summarizer">
      <div className="summarizer-header">
        <div className="summary-options">
          <div className="option-group">
            <label htmlFor="summary-type">Summary Type:</label>
            <select
              id="summary-type"
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value)}
            >
              <option value="abstractive">Rewritten (AI-Generated)</option>
              <option value="extractive">Key Sentences (Extracted)</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor="summary-length">Length:</label>
            <select
              id="summary-length"
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
            >
              <option value="brief">Brief</option>
              <option value="medium">Medium</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <button
          className="generate-button"
          onClick={handleGenerateSummary}
          disabled={loading || !content || content.length < 100}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating summary...</p>
        </div>
      ) : summary ? (
        <div className="summary-result">
          <div className="summary-content">
            <h4>
              {summaryType === "abstractive"
                ? "AI-Generated Summary"
                : "Key Sentences"}
            </h4>
            <div className="summary-text">
              {summaryType === "abstractive"
                ? summary.abstractive
                : summary.extractive.sentences.map((sentence, index) => (
                    <p key={index}>{sentence}</p>
                  ))}
            </div>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Original:</span>
                <span className="stat-value">
                  {summary.originalLength} characters
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Summary:</span>
                <span className="stat-value">
                  {summaryType === "abstractive"
                    ? summary.summaryLength
                    : summary.extractive.sentences.join(" ").length}{" "}
                  characters
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reduction:</span>
                <span className="stat-value">
                  {summaryType === "abstractive"
                    ? `${Math.round(
                        (1 - summary.summaryLength / summary.originalLength) *
                          100
                      )}%`
                    : `${Math.round(
                        (1 -
                          summary.extractive.sentences.join(" ").length /
                            summary.originalLength) *
                          100
                      )}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-actions">
            <button className="add-button" onClick={handleAddToNote}>
              Add to Note
            </button>
            <button
              className="regenerate-button"
              onClick={handleGenerateSummary}
            >
              Regenerate
            </button>
          </div>
        </div>
      ) : (
        <div className="summary-placeholder">
          <div className="placeholder-icon">📝</div>
          <p>Click "Generate Summary" to create a summary of your note.</p>
          <p className="helper-text">
            Your note should contain at least 100 characters of text for the
            best results.
          </p>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
