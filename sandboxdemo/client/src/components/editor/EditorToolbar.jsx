import React, { useState } from "react";

const EditorToolbar = ({
  execCommand,
  insertLink,
  insertImage,
  insertCheckbox,
  insertCodeBlock,
  disabled = false,
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  // Button style
  const buttonStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#5f6368',
    transition: 'all 0.2s ease',
    fontWeight: '600',
    margin: '0 2px'
  };

  const wideButtonStyle = {
    ...buttonStyle,
    width: 'auto',
    padding: '0 14px'
  };

  const dropdownPanelStyle = {
    position: 'absolute',
    top: '44px',
    left: '0',
    width: '250px',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '12px',
    zIndex: 100
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #d1d1d1',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '14px',
    outline: 'none'
  };

  const buttonInsertStyle = {
    padding: '8px 12px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    float: 'right',
    fontSize: '14px',
    fontWeight: '500'
  };

  // Handle link insertion
  const handleLinkInsert = () => {
    if (linkUrl) {
      insertLink?.(linkUrl);
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  // Handle image insertion
  const handleImageInsert = () => {
    if (imageUrl) {
      insertImage?.(imageUrl, imageAlt);
      setImageUrl("");
      setImageAlt("");
      setShowImageInput(false);
    }
  };

  // Toggle toolbar dropdowns
  const toggleLinkInput = (e) => {
    e.preventDefault(); // Prevent losing focus
    setShowLinkInput(!showLinkInput);
    setShowImageInput(false);
  };

  const toggleImageInput = (e) => {
    e.preventDefault(); // Prevent losing focus
    setShowImageInput(!showImageInput);
    setShowLinkInput(false);
  };

  // Wrapper for execCommand to prevent default and add more safety
  const safeExecCommand = (command, value = null) => (e) => {
    e.preventDefault(); // Prevent focus loss
    if (execCommand && !disabled) {
      execCommand(command, value);
    }
  };

  return (
    <div className="editor-toolbar" style={{
      display: 'flex',
      padding: '12px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      <div className="toolbar-group" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginRight: '12px'
      }}>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("bold")}
          title="Bold (Ctrl+B)"
          disabled={disabled}
          style={buttonStyle}
        >
          <strong>B</strong>
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("italic")}
          title="Italic (Ctrl+I)"
          disabled={disabled}
          style={buttonStyle}
        >
          <em>I</em>
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("underline")}
          title="Underline (Ctrl+U)"
          disabled={disabled}
          style={buttonStyle}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("strikeThrough")}
          title="Strikethrough"
          disabled={disabled}
          style={buttonStyle}
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
      </div>

      <div className="toolbar-divider" style={{
        width: '1px',
        height: '28px',
        backgroundColor: '#e0e0e0',
        margin: '0 8px'
      }}></div>

      <div className="toolbar-group" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginRight: '12px'
      }}>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h1>")}
          title="Heading 1"
          disabled={disabled}
          style={buttonStyle}
        >
          H1
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h2>")}
          title="Heading 2"
          disabled={disabled}
          style={buttonStyle}
        >
          H2
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h3>")}
          title="Heading 3"
          disabled={disabled}
          style={buttonStyle}
        >
          H3
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<p>")}
          title="Paragraph"
          disabled={disabled}
          style={buttonStyle}
        >
          P
        </button>
      </div>

      <div className="toolbar-divider" style={{
        width: '1px',
        height: '28px',
        backgroundColor: '#e0e0e0',
        margin: '0 8px'
      }}></div>

      <div className="toolbar-group" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginRight: '12px'
      }}>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("insertUnorderedList")}
          title="Bullet List"
          disabled={disabled}
          style={wideButtonStyle}
        >
          <span style={{ fontSize: '18px', marginRight: '5px' }}>•</span> List
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("insertOrderedList")}
          title="Numbered List"
          disabled={disabled}
          style={wideButtonStyle}
        >
          <span style={{ fontSize: '16px', marginRight: '5px' }}>1.</span> List
        </button>
        <button
          className="toolbar-button"
          onClick={(e) => {
            e.preventDefault();
            if (insertCheckbox && !disabled) insertCheckbox();
          }}
          title="Checklist"
          disabled={disabled}
          style={wideButtonStyle}
        >
          <span style={{ fontSize: '15px', marginRight: '5px' }}>☑</span> Task
        </button>
      </div>

      <div className="toolbar-divider" style={{
        width: '1px',
        height: '28px',
        backgroundColor: '#e0e0e0',
        margin: '0 8px'
      }}></div>

      <div className="toolbar-group" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginRight: '12px',
        position: 'relative'
      }}>
        <div className="toolbar-dropdown" style={{ position: 'relative' }}>
          <button
            className="toolbar-button"
            onClick={toggleLinkInput}
            title="Insert Link"
            disabled={disabled}
            style={wideButtonStyle}
          >
            <span style={{ fontSize: '16px', marginRight: '5px' }}>🔗</span> Link
          </button>

          {showLinkInput && (
            <div className="dropdown-panel" style={dropdownPanelStyle}>
              <input
                type="text"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={inputStyle}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkInsert();
                }}
                disabled={disabled}
                style={buttonInsertStyle}
              >
                Insert
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-dropdown" style={{ position: 'relative' }}>
          <button
            className="toolbar-button"
            onClick={toggleImageInput}
            title="Insert Image"
            disabled={disabled}
            style={wideButtonStyle}
          >
            <span style={{ fontSize: '16px', marginRight: '5px' }}>🖼️</span> Image
          </button>

          {showImageInput && (
            <div className="dropdown-panel" style={dropdownPanelStyle}>
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Alt Text (optional)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                style={inputStyle}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleImageInsert();
                }}
                disabled={disabled}
                style={buttonInsertStyle}
              >
                Insert
              </button>
            </div>
          )}
        </div>

        <button
          className="toolbar-button"
          onClick={(e) => {
            e.preventDefault();
            if (insertCodeBlock && !disabled) insertCodeBlock();
          }}
          title="Insert Code Block"
          disabled={disabled}
          style={wideButtonStyle}
        >
          <span style={{ fontSize: '16px', marginRight: '5px' }}>&lt;/&gt;</span> Code
        </button>
      </div>

      <div className="toolbar-divider" style={{
        width: '1px',
        height: '28px',
        backgroundColor: '#e0e0e0',
        margin: '0 8px'
      }}></div>

      <div className="toolbar-group" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("justifyLeft")}
          title="Align Left"
          disabled={disabled}
          style={buttonStyle}
        >
          <span style={{ fontSize: '18px' }}>⫷</span>
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("justifyCenter")}
          title="Align Center"
          disabled={disabled}
          style={buttonStyle}
        >
          <span style={{ fontSize: '18px' }}>≡</span>
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("justifyRight")}
          title="Align Right"
          disabled={disabled}
          style={buttonStyle}
        >
          <span style={{ fontSize: '18px' }}>⫸</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
