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
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={safeExecCommand("bold")}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          B
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("italic")}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          I
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("underline")}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        >
          U
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("strikeThrough")}
          title="Strikethrough"
          disabled={disabled}
        >
          S
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h1>")}
          title="Heading 1"
          disabled={disabled}
        >
          H1
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h2>")}
          title="Heading 2"
          disabled={disabled}
        >
          H2
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<h3>")}
          title="Heading 3"
          disabled={disabled}
        >
          H3
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("formatBlock", "<p>")}
          title="Paragraph"
          disabled={disabled}
        >
          P
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={safeExecCommand("insertUnorderedList")}
          title="Bullet List"
          disabled={disabled}
        >
          • List
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("insertOrderedList")}
          title="Numbered List"
          disabled={disabled}
        >
          1. List
        </button>
        <button
          className="toolbar-button"
          onClick={(e) => {
            e.preventDefault();
            if (insertCheckbox && !disabled) insertCheckbox();
          }}
          title="Checklist"
          disabled={disabled}
        >
          ☑ Task
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button
            className="toolbar-button"
            onClick={toggleLinkInput}
            title="Insert Link"
            disabled={disabled}
          >
            🔗 Link
          </button>

          {showLinkInput && (
            <div className="dropdown-panel">
              <input
                type="text"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkInsert();
                }}
                disabled={disabled}
              >
                Insert
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-dropdown">
          <button
            className="toolbar-button"
            onClick={toggleImageInput}
            title="Insert Image"
            disabled={disabled}
          >
            🖼️ Image
          </button>

          {showImageInput && (
            <div className="dropdown-panel">
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Alt Text (optional)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleImageInsert();
                }}
                disabled={disabled}
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
        >
          &lt;/&gt; Code
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={safeExecCommand("undo")}
          title="Undo"
          disabled={disabled}
        >
          ↩️ Undo
        </button>
        <button
          className="toolbar-button"
          onClick={safeExecCommand("redo")}
          title="Redo"
          disabled={disabled}
        >
          ↪️ Redo
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
