import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportModal from "../export/ExportModal";
import StyleChecker from "../common/StyleChecker";

const EditorHeader = ({
  title = "Untitled Note",
  note = {},
  onTitleChange,
  onSave,
  saving,
  lastSaved,
  toggleAIPanel,
  showAIPanel,
  toggleCollaborationPanel,
  showCollaborationPanel,
  toggleNoteFlowGPT,
  showNoteFlowGPT,
  activeUsers = [],
}) => {
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title || "Untitled Note");
  const [showExportModal, setShowExportModal] = useState(false);

  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "Not saved yet";

    const now = new Date();
    const saved = new Date(lastSaved);
    const diffMs = now - saved;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const hours = Math.floor(diffMinutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    return saved.toLocaleDateString();
  };

  // Handle navigation back to dashboard
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Handle title click to enter edit mode
  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  // Handle title input change
  const handleTitleInputChange = (e) => {
    setTitleValue(e.target.value);
  };

  // Handle title input blur (finish editing)
  const handleTitleInputBlur = () => {
    setEditingTitle(false);
    if (onTitleChange && typeof onTitleChange === 'function') {
      onTitleChange(titleValue || "Untitled Note");
    }
  };

  // Handle title input key press (Enter to save)
  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditingTitle(false);
      if (onTitleChange && typeof onTitleChange === 'function') {
        onTitleChange(titleValue || "Untitled Note");
      }
    }
  };

  // Handle export button click
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Add inline styles to ensure visibility
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    zIndex: 10
  };
  
  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };
  
  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };
  
  const backButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };
  
  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };
  
  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '14px'
  };
  
  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none'
  };

  return (
    <div className="editor-header" style={headerStyle}>
      <div className="header-left" style={leftSectionStyle}>
        <button className="back-button" style={backButtonStyle} onClick={handleBack}>
          ← Back
        </button>

        <div className="note-title">
          {editingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={handleTitleInputChange}
              onBlur={handleTitleInputBlur}
              onKeyPress={handleTitleKeyPress}
              autoFocus
              style={{fontSize: '20px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd'}}
            />
          ) : (
            <h2 onClick={handleTitleClick} style={titleStyle}>{titleValue || "Untitled Note"}</h2>
          )}
        </div>

        <StyleChecker />

        {activeUsers && activeUsers.length > 0 && (
          <div className="active-users">
            <span className="active-count">{activeUsers.length} active</span>
            <div className="user-avatars">
              {activeUsers.slice(0, 3).map((user, index) => (
                <div
                  key={user.userId || index}
                  className="user-avatar"
                  title={user.userName || "Unknown"}
                >
                  {(user.userName || "U").charAt(0)}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div
                  className="user-avatar more"
                  title={`${activeUsers.length - 3} more users`}
                >
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="header-right" style={rightSectionStyle}>
        <div className="save-status">
          {saving ? (
            <span className="saving" style={{color: '#ffa94d'}}>Saving...</span>
          ) : (
            <span className="saved" style={{color: '#666'}}>Last saved: {formatLastSaved()}</span>
          )}
        </div>

        <button 
          className={`toolbar-button ai-toggle ${showAIPanel ? 'active' : ''}`} 
          onClick={toggleAIPanel}
          title="Toggle AI Assistant"
          style={{...buttonStyle, backgroundColor: showAIPanel ? '#e0e0e0' : '#f0f0f0'}}
        >
          AI Assistant
        </button>

        <button 
          className={`toolbar-button noteflow-gpt-toggle ${showNoteFlowGPT ? 'active' : ''}`} 
          onClick={toggleNoteFlowGPT}
          title="Toggle NoteFlow GPT"
          style={{...buttonStyle, backgroundColor: showNoteFlowGPT ? '#e0e0e0' : '#f0f0f0'}}
        >
          NoteFlow GPT
        </button>

        <button 
          className={`toolbar-button collaboration-toggle ${showCollaborationPanel ? 'active' : ''}`} 
          onClick={toggleCollaborationPanel}
          title="Toggle Collaboration"
          style={{...buttonStyle, backgroundColor: showCollaborationPanel ? '#e0e0e0' : '#f0f0f0'}}
        >
          Collaborate
        </button>

        <button 
          className="toolbar-button export-button" 
          onClick={handleExport}
          title="Export Note"
          style={buttonStyle}
        >
          Export
        </button>

        <button 
          className="toolbar-button save-button" 
          onClick={onSave}
          disabled={saving}
          title="Save Note"
          style={saveButtonStyle}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          note={note}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default EditorHeader;
