import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportModal from "../export/ExportModal";
import MathAgent from "../math/MathAgent";

const EditorHeader = ({
  title = "Untitled Note",
  note = {},
  onTitleChange,
  onSave,
  saving,
  toggleAIPanel,
  showAIPanel,
  toggleCollaborationPanel,
  showCollaborationPanel,
  toggleNoteFlowGPT,
  showNoteFlowGPT,
  toggleMathAgent,
  showMathAgent,
  toggleResearchAgent = () => {},
  showResearchAgent = false,
  activeUsers = [],
}) => {
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title || "Untitled Note");
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Handler for research agent toggle with fallback
  const handleResearchToggle = () => {
    if (toggleResearchAgent && typeof toggleResearchAgent === 'function') {
      toggleResearchAgent();
    }
  };

  // Add inline styles to ensure visibility
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    background: 'linear-gradient(to right, #f5f7fa, #e0f0ff)', // Subtle gradient background
    borderBottom: 'none',
    zIndex: 11, // Higher than toolbar
    height: '68px',
    boxShadow: 'none',
    marginBottom: 0,
    paddingBottom: 0
  };
  
  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  };
  
  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  };
  
  const backButtonStyle = {
    padding: '10px 18px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    color: '#1a73e8',
    gap: '5px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  
  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#202124',
    textShadow: '0 1px 1px rgba(255,255,255,0.8)'
  };
  
  const buttonStyle = {
    padding: '10px 18px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    color: '#5f6368',
    minWidth: '105px',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  
  const saveButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(to bottom, #4caf50, #43a047)',
    color: 'white',
    padding: '10px 20px',
    boxShadow: '0 2px 6px rgba(76, 175, 80, 0.3)'
  };

  const mathButtonStyle = {
    ...buttonStyle,
    backgroundColor: showMathAgent ? '#e0f0ff' : 'rgba(255,255,255,0.7)',
    color: '#1a73e8',
    borderLeft: showMathAgent ? '3px solid #1a73e8' : 'none',
    boxShadow: showMathAgent ? '0 2px 8px rgba(26, 115, 232, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const researchButtonStyle = {
    ...buttonStyle,
    backgroundColor: showResearchAgent ? '#fef7e0' : 'rgba(255,255,255,0.7)',
    color: '#f9ab00',
    borderLeft: showResearchAgent ? '3px solid #f9ab00' : 'none',
    boxShadow: showResearchAgent ? '0 2px 8px rgba(249, 171, 0, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const aiButtonStyle = {
    ...buttonStyle,
    backgroundColor: showAIPanel ? '#e8eaed' : 'rgba(255,255,255,0.7)',
    color: '#5f6368',
    borderLeft: showAIPanel ? '3px solid #202124' : 'none',
    boxShadow: showAIPanel ? '0 2px 8px rgba(32, 33, 36, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const noteflowButtonStyle = {
    ...buttonStyle,
    backgroundColor: showNoteFlowGPT ? '#e6f4ea' : 'rgba(255,255,255,0.7)',
    color: '#0f9d58',
    borderLeft: showNoteFlowGPT ? '3px solid #0f9d58' : 'none',
    boxShadow: showNoteFlowGPT ? '0 2px 8px rgba(15, 157, 88, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const collaborateButtonStyle = {
    ...buttonStyle,
    backgroundColor: showCollaborationPanel ? '#fce8e6' : 'rgba(255,255,255,0.7)',
    color: '#d93025',
    borderLeft: showCollaborationPanel ? '3px solid #d93025' : 'none',
    boxShadow: showCollaborationPanel ? '0 2px 8px rgba(217, 48, 37, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const exportButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: '#5f6368'
  };

  // Icon styles with modern colors
  const iconStyles = {
    math: { 
      color: '#1a73e8',
      fontSize: '20px',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    research: { 
      color: '#f9ab00',
      fontSize: '18px', 
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    ai: { 
      color: '#5f6368',
      fontSize: '18px',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    gpt: { 
      color: '#0f9d58',
      fontSize: '18px',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    collaborate: { 
      color: '#d93025',
      fontSize: '18px',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    export: { 
      color: '#5f6368',
      fontSize: '18px',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    }
  };

  return (
    <div className="editor-header" style={headerStyle}>
      <div className="header-left" style={leftSectionStyle}>
        <button className="back-button" style={backButtonStyle} onClick={handleBack}>
          <span style={{ fontSize: '18px', color: '#1a73e8' }}>←</span> Back
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
              style={{
                fontSize: '20px', 
                padding: '10px 15px',
                borderRadius: '6px', 
                border: '1px solid #d2e3fc',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset',
                width: '300px',
                outline: 'none',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 onClick={handleTitleClick} style={titleStyle}>{titleValue || "Untitled Note"}</h2>
              <span style={{ 
                fontSize: '14px', 
                color: '#1a73e8', 
                cursor: 'pointer', 
                padding: '3px',
                borderRadius: '3px'
              }}>
                ✎
              </span>
            </div>
          )}
        </div>

        {activeUsers && activeUsers.length > 0 && (
          <div className="active-users" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(to right, #e8f0fe, #d2e3fc)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            color: '#1a73e8',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <span className="active-count" style={{ fontWeight: '500' }}>{activeUsers.length} active</span>
            <div className="user-avatars" style={{ display: 'flex' }}>
              {activeUsers.slice(0, 3).map((user, index) => (
                <div
                  key={user.userId || index}
                  className="user-avatar"
                  title={user.userName || "Unknown"}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: ['#4285f4', '#0f9d58', '#f4b400', '#db4437'][index % 4],
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: index > 0 ? '-5px' : '0',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {(user.userName || "U").charAt(0)}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div
                  className="user-avatar more"
                  title={`${activeUsers.length - 3} more users`}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#70757a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginLeft: '-5px',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="header-right" style={rightSectionStyle}>
        <button 
          className={`toolbar-button math-agent-toggle ${showMathAgent ? 'active' : ''}`} 
          onClick={toggleMathAgent}
          title="Toggle Math Agent"
          style={mathButtonStyle}
        >
          <span style={iconStyles.math}>∑</span> Math
        </button>

        <button 
          className={`toolbar-button math-research-agent-toggle ${showResearchAgent ? 'active' : ''}`} 
          onClick={handleResearchToggle}
          title="Toggle Math Research"
          style={researchButtonStyle}
        >
          <span style={iconStyles.research}>🔍</span> Math Research
        </button>

        <button 
          className={`toolbar-button ai-toggle ${showAIPanel ? 'active' : ''}`} 
          onClick={toggleAIPanel}
          title="Toggle AI Assistant"
          style={aiButtonStyle}
        >
          <span style={iconStyles.ai}>⚙️</span> AI Assistant
        </button>

        <button 
          className={`toolbar-button noteflow-gpt-toggle ${showNoteFlowGPT ? 'active' : ''}`} 
          onClick={toggleNoteFlowGPT}
          title="Toggle NoteFlow GPT"
          style={noteflowButtonStyle}
        >
          <span style={iconStyles.gpt}>💬</span> GPT
        </button>

        <button 
          className={`toolbar-button collaboration-toggle ${showCollaborationPanel ? 'active' : ''}`} 
          onClick={toggleCollaborationPanel}
          title="Toggle Collaboration"
          style={collaborateButtonStyle}
        >
          <span style={iconStyles.collaborate}>👥</span> Collaborate
        </button>

        <button 
          className="toolbar-button export-button" 
          onClick={handleExport}
          title="Export Note"
          style={exportButtonStyle}
        >
          <span style={iconStyles.export}>↗️</span> Export
        </button>

        <button 
          className="toolbar-button save-button" 
          onClick={onSave}
          disabled={saving}
          title="Save Note"
          style={{
            ...saveButtonStyle,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? '0 1px 2px rgba(0,0,0,0.1)' : '0 2px 6px rgba(76, 175, 80, 0.3)'
          }}
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
