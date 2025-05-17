import React, { useState, useEffect, useRef } from "react";
import "../../styles/PlainTextEditor.css";
import { cloudinaryConfig } from '../../config/cloudinary';
import '../../styles/CloudinaryComponents.css';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';
import LocalImageUploader from './LocalImageUploader';

/**
 * Simple plain text editor with LTR text direction enforcement and formatting toolbar
 */
const PlainTextEditor = ({ initialContent = "", onChange, readOnly = false }) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("16px");
  const [fontColor, setFontColor] = useState("#333333");
  const [textAlign, setTextAlign] = useState("left");
  const [showSpecialChars, setShowSpecialChars] = useState(false);

  // Font families
  const fontFamilies = [
    "Arial", "Helvetica", "Times New Roman", "Courier New", 
    "Georgia", "Verdana", "Tahoma", "Trebuchet MS", "Segoe UI"
  ];

  // Font sizes
  const fontSizes = [
    "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"
  ];
  
  // Special characters
  const specialCharacters = [
    "©", "®", "™", "€", "£", "¥", "§", "±", "×", "÷", "≠", "≈", "≤", "≥", "°", "µ", 
    "→", "←", "↑", "↓", "♥", "♣", "♠", "♦", "★", "☆", "☎", "✓", "✗", "•", "…", "¿", 
    "¡", "¼", "½", "¾", "α", "β", "π", "Σ", "Ω", "∞", "♫", "♪"
  ];

  // Initialize with content when it changes externally
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
      
      // Log content sync
      console.log("Editor content synchronized with parent component");
    }
  }, [initialContent]);

  // Apply selected styling to textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.fontFamily = fontFamily;
      textareaRef.current.style.fontSize = fontSize;
      textareaRef.current.style.color = fontColor;
      textareaRef.current.style.textAlign = textAlign;
    }
  }, [fontFamily, fontSize, fontColor, textAlign]);

  // Handle text changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    
    if (onChange) {
      // Ensure we're passing the raw content to parent
      console.log("Content change detected, length:", newValue.length);
      onChange(newValue);
    }
  };

  // Text transformation functions with synchronized state updates
  const transformSelectedText = (transformFn) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) return; // No selection
    
    const selectedText = content.substring(start, end);
    const transformedText = transformFn(selectedText);
    
    const newContent = 
      content.substring(0, start) + 
      transformedText + 
      content.substring(end);
    
    // Update local state
    setContent(newContent);
    
    // Notify parent of change
    if (onChange) {
      console.log("Content transformed, new length:", newContent.length);
      onChange(newContent);
    }
    
    // Reset the selection after transformation
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, start + transformedText.length);
    }, 0);
  };

  // Insert at cursor position
  const insertAtCursor = (textToInsert, selectionOffset = 0) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const newContent = 
      content.substring(0, start) + 
      textToInsert + 
      content.substring(end);
    
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
    
    // Set cursor position after insertion
    setTimeout(() => {
      textareaRef.current.focus();
      const newPosition = start + selectionOffset;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Text formatting functions
  const makeBold = () => transformSelectedText(text => `**${text}**`);
  const makeItalic = () => transformSelectedText(text => `_${text}_`);
  const makeUnderline = () => transformSelectedText(text => `<u>${text}</u>`);
  const makeStrikethrough = () => transformSelectedText(text => `~~${text}~~`);
  // Define these as variables for future use
  const SUPERSCRIPT = text => `<sup>${text}</sup>`;
  const SUBSCRIPT = text => `<sub>${text}</sub>`;

  // Heading formatting
  const applyHeading = (level) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    // If no text is selected, use the current line
    let selectedText;
    let startOfLine = start;
    let endOfLine = end;
    
    if (start === end) {
      // Find the start of the current line
      startOfLine = content.lastIndexOf('\n', start - 1) + 1;
      if (startOfLine === 0 && start !== 0) startOfLine = 0;
      
      // Find the end of the current line
      endOfLine = content.indexOf('\n', end);
      if (endOfLine === -1) endOfLine = content.length;
      
      selectedText = content.substring(startOfLine, endOfLine);
    } else {
      selectedText = content.substring(start, end);
    }
    
    // Remove any existing heading
    selectedText = selectedText.replace(/^#+\s/, '');
    
    // Add the new heading
    const headingPrefix = '#'.repeat(level) + ' ';
    const transformedText = headingPrefix + selectedText;
    
    const newContent = 
      content.substring(0, startOfLine) + 
      transformedText + 
      content.substring(endOfLine);
    
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  // List formatting
  const addBulletList = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const lines = selectedText.split('\n');
    const bulletedLines = lines.map(line => line.trim() ? `• ${line}` : line).join('\n');
    
    const newContent = 
      content.substring(0, start) + 
      bulletedLines + 
      content.substring(end);
    
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  const addNumberedList = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const lines = selectedText.split('\n');
    const numberedLines = lines.map((line, index) => 
      line.trim() ? `${index + 1}. ${line}` : line
    ).join('\n');
    
    const newContent = 
      content.substring(0, start) + 
      numberedLines + 
      content.substring(end);
    
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  // Extract URL from markdown link format: [text](url)
  const EXTRACT_URL = (text) => {
    const linkRegex = /\[.*?\]\((.*?)\)/;
    const match = text.match(linkRegex);
    return match ? match[1] : null;
  };

  // Link operations
  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    
    const linkText = prompt("Enter link text:", url);
    if (!linkText) return;
    
    const link = `[${linkText}](${url})`;
    
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const newContent = 
      content.substring(0, start) + 
      link + 
      content.substring(end);
    
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  const removeLink = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    // Check if selection is a markdown link [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/;
    const match = selectedText.match(linkRegex);
    
    if (match) {
      // Extract the link text and replace the entire link with just the text
      const linkText = match[1];
      
      const newContent = 
        content.substring(0, start) + 
        linkText + 
        content.substring(end);
      
      setContent(newContent);
      if (onChange) onChange(newContent);
      
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + linkText.length);
      }, 0);
    } else {
      alert("No link selected. Please select a link in the format [text](url).");
    }
  };

  // Structure and layout
  const insertBlockquote = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) {
      // If no text is selected, insert an empty blockquote
      insertAtCursor("\n> ", 3);
    } else {
      // If text is selected, convert it to a blockquote
      const selectedText = content.substring(start, end);
      const lines = selectedText.split('\n');
      const blockquoteText = lines.map(line => `> ${line}`).join('\n');
      
      const newContent = 
        content.substring(0, start) + 
        blockquoteText + 
        content.substring(end);
      
      setContent(newContent);
      if (onChange) onChange(newContent);
    }
  };

  const insertParagraph = () => {
    insertAtCursor("\n\n", 2);
  };

  const insertLineBreak = () => {
    insertAtCursor("  \n", 3);
  };

  const insertPageBreak = () => {
    insertAtCursor("\n\n---\n\n", 5);
  };

  // Insert special character
  const insertSpecialChar = (char) => {
    insertAtCursor(char, char.length);
    setShowSpecialChars(false);
  };

  // Insert image
  const insertImage = async () => {
    if (readOnly) return;
    
    // Create a modal for the Local Image Uploader
    const modal = document.createElement('div');
    modal.className = 'cloudinary-widget-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'cloudinary-widget-modal-content';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Upload Image';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cloudinary-widget-close-button';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    modalContent.appendChild(heading);
    modalContent.appendChild(closeBtn);
    
    // Create container for uploader
    const uploaderContainer = document.createElement('div');
    uploaderContainer.id = 'local-image-uploader-container';
    modalContent.appendChild(uploaderContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Initialize the uploader once the modal is in the DOM
    const startPos = textareaRef.current.selectionStart;
    
    // Insert a placeholder so we know where to insert the image later
    const placeholder = `![Uploading...](uploading)`;
    const tempContent = 
      content.substring(0, startPos) + 
      placeholder + 
      content.substring(startPos);
    
    setContent(tempContent);
    if (onChange) onChange(tempContent);
    
    // Render our uploader to the container
    const handleUploadSuccess = (info) => {
      console.log('Upload success:', info);
      
      // Replace the placeholder with the image URL
      const altText = info.original_filename || 'image';
      const imageMarkdown = `![${altText}](${info.secure_url})`;
      
      const newContent = tempContent.replace(placeholder, imageMarkdown);
      setContent(newContent);
      if (onChange) onChange(newContent);
      
      // Close the modal
      document.body.removeChild(modal);
    };
    
    const handleUploadError = (error) => {
      console.error('Upload error:', error);
      
      // Remove the placeholder
      const newContent = tempContent.replace(placeholder, '');
      setContent(newContent);
      if (onChange) onChange(newContent);
      
      // Show error message
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
      
      // Close the modal
      document.body.removeChild(modal);
    };
    
    const handleClose = () => {
      // Remove the placeholder if upload was cancelled
      const newContent = tempContent.replace(placeholder, '');
      setContent(newContent);
      if (onChange) onChange(newContent);
      
      // Close the modal
      document.body.removeChild(modal);
    };
    
    // Create a new React root to render the uploader
    const ReactDOM = await import('react-dom/client');
    const root = ReactDOM.createRoot(uploaderContainer);
    root.render(
      <LocalImageUploader
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
        onClose={handleClose}
      />
    );
  };

  // Insert video
  const insertVideo = async () => {
    if (readOnly) return;
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        // Show loading message
        const placeholder = `[Uploading video ${file.name}...](uploading)`;
        const start = textareaRef.current.selectionStart;
        
        const tempContent = 
          content.substring(0, start) + 
          placeholder + 
          content.substring(start);
        
        setContent(tempContent);
        if (onChange) onChange(tempContent);
        
        // Check file size - warn if large
        if (file.size > 25 * 1024 * 1024) { // 25MB
          alert('Warning: Large video files may take longer to upload. Please wait...');
        }
        
        // Upload to Cloudinary with resource_type=video
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'noteflow_uploads'); // Replace with your actual preset name
        formData.append('folder', cloudinaryConfig.folder);
        
        console.log(`Uploading video to Cloudinary: ${file.name} (${Math.round(file.size/1024)} KB)`);
        console.log(`Using cloud name: ${cloudinaryConfig.cloudName}`);
        console.log(`Using upload preset: noteflow_uploads`);
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        // Get the response text for better error diagnostics
        const responseText = await response.text();
        
        if (!response.ok) {
          console.error(`Cloudinary video upload failed with status: ${response.status}`);
          console.error(`Response body: ${responseText}`);
          throw new Error(`Upload failed with status: ${response.status}. Details: ${responseText}`);
        }
        
        // Parse the response text as JSON
        const cloudinaryResponse = JSON.parse(responseText);
        console.log(`Video upload succeeded. Public ID: ${cloudinaryResponse.public_id}`);
          
        // Replace the placeholder with the Cloudinary video URL
          const title = file.name.split('.')[0]; // Use filename as title
        const videoMarkdown = `[Video: ${title}](${cloudinaryResponse.secure_url})`;
          
          const newContent = tempContent.replace(placeholder, videoMarkdown);
          setContent(newContent);
          if (onChange) onChange(newContent);
          
        console.log("Video added via Cloudinary:", cloudinaryResponse.secure_url);
      } catch (error) {
        console.error(`Error adding video: ${error.message}`);
        alert('Failed to upload video. Please try again.');
        
        // Remove the placeholder if it exists
        try {
          const placeholder = `[Uploading video ${file.name}...](uploading)`;
          if (content.includes(placeholder)) {
            const newContent = content.replace(placeholder, '');
            setContent(newContent);
            if (onChange) onChange(newContent);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up placeholder:", cleanupError);
        }
      }
    };
    
    // Trigger file selection
    fileInput.click();
  };

  // Insert horizontal line
  const insertHorizontalLine = () => {
    insertAtCursor("\n\n---\n\n", 5);
  };

  // Insert code block or inline code
  const insertCodeBlock = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) {
      // If no text is selected, insert empty code block
      insertAtCursor("```\n\n```", 4);
    } else {
      // If text is selected, wrap it in a code block
      const selectedText = content.substring(start, end);
      const transformedText = "```\n" + selectedText + "\n```";
      
      const newContent = 
        content.substring(0, start) + 
        transformedText + 
        content.substring(end);
      
      setContent(newContent);
      if (onChange) onChange(newContent);
    }
  };

  const insertInlineCode = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) {
      // If no text is selected, insert empty inline code
      insertAtCursor("``", 1);
    } else {
      // If text is selected, wrap it in backticks
      transformSelectedText(text => '`' + text + '`');
    }
  };

  // Insert table
  const insertTable = () => {
    const rows = prompt("Enter number of rows:", "3");
    if (!rows || isNaN(parseInt(rows)) || parseInt(rows) < 1) return;
    
    const cols = prompt("Enter number of columns:", "3");
    if (!cols || isNaN(parseInt(cols)) || parseInt(cols) < 1) return;
    
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    // Create header row
    let tableText = '| ';
    for (let i = 0; i < numCols; i++) {
      tableText += `Column ${i+1} | `;
    }
    tableText += '\n| ';
    
    // Create separator row
    for (let i = 0; i < numCols; i++) {
      tableText += '--- | ';
    }
    tableText += '\n';
    
    // Create data rows
    for (let i = 0; i < numRows; i++) {
      tableText += '| ';
      for (let j = 0; j < numCols; j++) {
        tableText += `Cell ${i+1},${j+1} | `;
      }
      tableText += '\n';
    }
    
    insertAtCursor('\n' + tableText + '\n', 2);
  };

  // Undo/Redo functionality will rely on browser's native implementation
  
  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        {/* Text formatting section */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button" 
            onClick={makeBold} 
            title="Bold"
            disabled={readOnly}
          >
            <strong>B</strong>
          </button>
          <button 
            className="toolbar-button" 
            onClick={makeItalic} 
            title="Italic"
            disabled={readOnly}
          >
            <em>I</em>
          </button>
          <button 
            className="toolbar-button" 
            onClick={makeUnderline} 
            title="Underline"
            disabled={readOnly}
          >
            <u>U</u>
          </button>
          <button 
            className="toolbar-button" 
            onClick={makeStrikethrough} 
            title="Strikethrough"
            disabled={readOnly}
          >
            <span style={{ textDecoration: 'line-through' }}>S</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Headings section */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={() => applyHeading(1)}
            title="Heading 1"
            disabled={readOnly}
          >
            H1
          </button>
          <button 
            className="toolbar-button"
            onClick={() => applyHeading(2)}
            title="Heading 2"
            disabled={readOnly}
          >
            H2
          </button>
          <button 
            className="toolbar-button"
            onClick={() => applyHeading(3)}
            title="Heading 3"
            disabled={readOnly}
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Font styling section */}
        <div className="toolbar-group">
          <select 
            className="toolbar-select"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            disabled={readOnly}
            title="Font Family"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          
          <select 
            className="toolbar-select"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            disabled={readOnly}
            title="Font Size"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          
          <input 
            type="color" 
            className="toolbar-color-picker"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            disabled={readOnly}
            title="Font Color"
          />
        </div>

        <div className="toolbar-divider"></div>

        {/* Text alignment section */}
        <div className="toolbar-group">
          <button 
            className={`toolbar-button ${textAlign === 'left' ? 'active' : ''}`}
            onClick={() => setTextAlign('left')}
            title="Align Left"
            disabled={readOnly}
          >
            ⟨⟨
          </button>
          <button 
            className={`toolbar-button ${textAlign === 'center' ? 'active' : ''}`}
            onClick={() => setTextAlign('center')}
            title="Center"
            disabled={readOnly}
          >
            ⟨⟩
          </button>
          <button 
            className={`toolbar-button ${textAlign === 'right' ? 'active' : ''}`}
            onClick={() => setTextAlign('right')}
            title="Align Right"
            disabled={readOnly}
          >
            ⟩⟩
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Lists section */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={addBulletList}
            title="Bullet List"
            disabled={readOnly}
          >
            •
          </button>
          <button 
            className="toolbar-button"
            onClick={addNumberedList}
            title="Numbered List"
            disabled={readOnly}
          >
            1.
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Structure and layout */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={insertParagraph}
            title="New Paragraph"
            disabled={readOnly}
          >
            ¶
          </button>
          <button 
            className="toolbar-button"
            onClick={insertBlockquote}
            title="Blockquote"
            disabled={readOnly}
          >
            "
          </button>
          <button 
            className="toolbar-button"
            onClick={insertLineBreak}
            title="Line Break"
            disabled={readOnly}
          >
            ↵
          </button>
          <button 
            className="toolbar-button"
            onClick={insertPageBreak}
            title="Page Break"
            disabled={readOnly}
          >
            ⤓
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Insert elements section */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={insertLink}
            title="Insert Link"
            disabled={readOnly}
          >
            🔗
          </button>
          <button 
            className="toolbar-button"
            onClick={removeLink}
            title="Remove Link"
            disabled={readOnly}
          >
            🔗✕
          </button>
          <button 
            className="toolbar-button"
            onClick={insertImage}
            title="Insert Image"
            disabled={readOnly}
          >
            🖼️
          </button>
          <button 
            className="toolbar-button"
            onClick={insertVideo}
            title="Insert Video"
            disabled={readOnly}
          >
            🎬
          </button>
          <button 
            className="toolbar-button"
            onClick={insertTable}
            title="Insert Table"
            disabled={readOnly}
          >
            ⊞
          </button>
          <button 
            className="toolbar-button"
            onClick={insertHorizontalLine}
            title="Insert Horizontal Line"
            disabled={readOnly}
          >
            —
          </button>
          <button 
            className="toolbar-button"
            onClick={() => setShowSpecialChars(!showSpecialChars)}
            title="Insert Special Character"
            disabled={readOnly}
          >
            Ω
          </button>
          <button 
            className="toolbar-button"
            onClick={insertCodeBlock}
            title="Insert Code Block"
            disabled={readOnly}
          >
            { }
          </button>
          <button 
            className="toolbar-button"
            onClick={insertInlineCode}
            title="Insert Inline Code"
            disabled={readOnly}
          >
            `
          </button>
        </div>
      </div>

      {/* Special Characters Panel */}
      {showSpecialChars && (
        <div className="special-chars-panel">
          {specialCharacters.map((char, index) => (
            <button 
              key={index}
              className="special-char-button"
              onClick={() => insertSpecialChar(char)}
              disabled={readOnly}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      <div className="editor-content">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          className="editor-textarea"
          placeholder="Start typing here..."
          readOnly={readOnly}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="true"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default PlainTextEditor; 