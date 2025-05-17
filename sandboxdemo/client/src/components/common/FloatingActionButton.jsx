import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Create new note
  const createNewNote = () => {
    navigate("/notes/new");
    setIsExpanded(false);
  };

  // Show import modal
  const showImport = () => {
    // This would trigger the import modal
    // For now, just close the FAB
    setIsExpanded(false);
  };

  return (
    <div className={`floating-action-button ${isExpanded ? "expanded" : ""}`}>
      {isExpanded && (
        <div className="fab-actions">
          <button
            className="fab-action import"
            onClick={showImport}
            title="Import"
          >
            📥
          </button>
          <button
            className="fab-action new-note"
            onClick={createNewNote}
            title="New Note"
          >
            📝
          </button>
        </div>
      )}

      <button className="fab-main" onClick={toggleExpanded}>
        {isExpanded ? "✕" : "+"}
      </button>
    </div>
  );
};

export default FloatingActionButton;
