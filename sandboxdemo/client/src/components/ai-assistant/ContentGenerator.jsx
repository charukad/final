import React, { useState } from "react";
import { generateContent } from "../../services/aiService";

const ContentGenerator = ({ content, onAddToNote }) => {
  const [generationType, setGenerationType] = useState("continue");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get prompt based on generation type
  const getPrompt = () => {
    switch (generationType) {
      case "continue":
        return "Continue writing from where this text leaves off, maintaining the same style and tone:";
      case "expand":
        return "Expand on the ideas presented in this text, providing more detail and examples:";
      case "counter":
        return "Present a counterargument or alternative perspective to the following text:";
      case "summarize":
        return "Summarize the main points of this text concisely:";
      case "outline":
        return "Create an outline based on the topics and ideas in this text:";
      case "custom":
        return customPrompt;
      default:
        return "";
    }
  };

  // Generate content
  const handleGenerateContent = async () => {
    if (!content) {
      setError("Please add some content to your note first.");
      return;
    }

    const prompt = getPrompt();
    if (generationType === "custom" && !customPrompt.trim()) {
      setError("Please enter a custom prompt.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateContent(prompt, content);
      setGeneratedContent(result.content);
    } catch (error) {
      console.error("Error generating content:", error);
      setError("Failed to generate content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add generated content to note
  const handleAddToNote = () => {
    if (!generatedContent) return;

    if (onAddToNote) {
      onAddToNote(generatedContent);
    }
  };

  return (
    <div className="content-generator">
      <div className="generator-header">
        <div className="generator-options">
          <div className="option-group">
            <label htmlFor="generation-type">Generate:</label>
            <select
              id="generation-type"
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value)}
            >
              <option value="continue">Continue Writing</option>
              <option value="expand">Expand on Ideas</option>
              <option value="counter">Counter Argument</option>
              <option value="summarize">Summarize</option>
              <option value="outline">Create Outline</option>
              <option value="custom">Custom Prompt</option>
            </select>
          </div>
        </div>

        {generationType === "custom" && (
          <div className="custom-prompt">
            <label htmlFor="custom-prompt-input">Custom Prompt:</label>
            <textarea
              id="custom-prompt-input"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt for the AI..."
              rows={3}
            ></textarea>
          </div>
        )}

        <button
          className="generate-button"
          onClick={handleGenerateContent}
          disabled={
            loading ||
            !content ||
            (generationType === "custom" && !customPrompt.trim())
          }
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating content...</p>
        </div>
      ) : generatedContent ? (
        <div className="generated-content">
          <h4>Generated Content</h4>
          <div className="content-text">
            {generatedContent
              .split("\n")
              .map((paragraph, index) =>
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              )}
          </div>

          <div className="generator-actions">
            <button className="add-button" onClick={handleAddToNote}>
              Add to Note
            </button>
            <button
              className="regenerate-button"
              onClick={handleGenerateContent}
            >
              Regenerate
            </button>
          </div>
        </div>
      ) : (
        <div className="generator-placeholder">
          <div className="placeholder-icon">✨</div>
          <p>Select a generation type and click "Generate Content".</p>
          <p className="helper-text">
            The AI will use your existing note content as context to generate
            relevant additional content.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
