import React, { useState, useEffect } from "react";
import { getTopicInsights, researchTopic } from "../../services/aiService";

const ResearchAssistant = ({ content, onAddToNote }) => {
  const [topic, setTopic] = useState("");
  const [topicInsights, setTopicInsights] = useState(null);
  const [researchResults, setResearchResults] = useState(null);
  const [researchDepth, setResearchDepth] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract potential topics from content
  useEffect(() => {
    if (!content || content.length < 20) return;

    // Simple topic extraction - in a real app, this would be more sophisticated
    const lines = content.split("\n");
    const firstLine = lines[0].replace(/<[^>]*>/g, "").trim();

    if (firstLine.length > 0 && firstLine.length < 100) {
      setTopic(firstLine);
    }
  }, [content]);

  // Get topic insights
  const handleGetInsights = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const insights = await getTopicInsights(topic);
      setTopicInsights(insights);
      setResearchResults(null);
    } catch (error) {
      console.error("Error getting topic insights:", error);
      setError("Failed to get insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Do deeper research
  const handleDoResearch = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const research = await researchTopic(topic, researchDepth);
      setResearchResults(research);
    } catch (error) {
      console.error("Error researching topic:", error);
      setError("Failed to research topic. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add research to note
  const handleAddToNote = (content) => {
    if (onAddToNote) {
      onAddToNote(content);
    }
  };

  return (
    <div className="research-assistant">
      <div className="research-header">
        <div className="topic-input-group">
          <label htmlFor="topic-input">Research Topic:</label>
          <input
            type="text"
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to research"
          />
        </div>

        <button
          className="insight-button"
          onClick={handleGetInsights}
          disabled={loading || !topic.trim()}
        >
          Get Insights
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Researching topic...</p>
        </div>
      ) : topicInsights ? (
        <div className="research-results">
          <div className="insights-section">
            <h4>Topic Insights: {topicInsights.topic}</h4>

            <div className="insight-description">
              {topicInsights.insights.description}
            </div>

            <h5>Related Concepts</h5>
            <ul className="related-concepts">
              {topicInsights.insights.relatedConcepts.map((concept, index) => (
                <li key={index} className="concept-item">
                  <strong>{concept.name}:</strong> {concept.description}
                </li>
              ))}
            </ul>

            <h5>Perspectives</h5>
            <ul className="perspectives">
              {topicInsights.insights.perspectives.map((perspective, index) => (
                <li key={index} className="perspective-item">
                  <strong>{perspective.name}:</strong> {perspective.description}
                </li>
              ))}
            </ul>

            <h5>Related Topics</h5>
            <div className="related-topics">
              {topicInsights.insights.relatedTopics.map(
                (relatedTopic, index) => (
                  <div
                    key={index}
                    className="related-topic"
                    onClick={() => setTopic(relatedTopic.name)}
                  >
                    {relatedTopic.name}
                  </div>
                )
              )}
            </div>

            <div className="deeper-research">
              <h5>Need more information?</h5>
              <div className="research-controls">
                <select
                  value={researchDepth}
                  onChange={(e) => setResearchDepth(e.target.value)}
                >
                  <option value="brief">Brief Overview</option>
                  <option value="medium">Standard Research</option>
                  <option value="deep">Deep Dive</option>
                </select>
                <button
                  className="research-button"
                  onClick={handleDoResearch}
                  disabled={loading}
                >
                  Research Topic
                </button>
              </div>
            </div>
          </div>

          <div className="insight-actions">
            <button
              className="add-button"
              onClick={() =>
                handleAddToNote(
                  `## ${topicInsights.topic} - Key Concepts\n\n` +
                    `${topicInsights.insights.description}\n\n` +
                    `### Related Concepts\n\n` +
                    topicInsights.insights.relatedConcepts
                      .map(
                        (concept) =>
                          `- **${concept.name}**: ${concept.description}`
                      )
                      .join("\n")
                )
              }
            >
              Add to Note
            </button>
          </div>
        </div>
      ) : researchResults ? (
        <div className="research-results">
          <div className="research-content">
            <h4>Research: {researchResults.topic}</h4>
            <div className="research-markdown">{researchResults.research}</div>
          </div>

          <div className="research-actions">
            <button
              className="add-button"
              onClick={() => handleAddToNote(researchResults.research)}
            >
              Add to Note
            </button>
            <button
              className="back-button"
              onClick={() => {
                setResearchResults(null);
              }}
            >
              Back to Insights
            </button>
          </div>
        </div>
      ) : (
        <div className="research-placeholder">
          <div className="placeholder-icon">🔍</div>
          <p>Enter a topic and click "Get Insights" to start researching.</p>
          <p className="helper-text">
            Our AI will analyze your topic and provide related concepts,
            perspectives, and suggested research areas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResearchAssistant;
