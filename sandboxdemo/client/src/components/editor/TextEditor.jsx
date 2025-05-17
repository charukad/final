import React, { useState, useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
// import socketService from "../../services/socketService";
import { useParams } from "react-router-dom";
import "../../styles/TextEditor.css"; // Ensure CSS is imported

const TextEditor = ({
  content,
  onChange,
  comments = [],
  onAddComment,
  readOnly = false,
}) => {
  const { id: _id } = useParams();
  const editorRef = useRef(null);
  const toolbarRef = useRef(null); // Add ref for toolbar
  const [editorState, setEditorState] = useState(content || "");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);
  const [remoteSelections, _setRemoteSelections] = useState({});
  const lastSelectionRef = useRef(null); // Store last selection position
  const lastContentRef = useRef(content || ""); // Store the last valid content
  const protectContentTimer = useRef(null); // Timer for content protection

  // Fixed style to force LTR text direction
  const forcedLTRStyle = {
    direction: 'ltr',
    textAlign: 'left',
    unicodeBidi: 'isolate-override',
    writingMode: 'horizontal-tb',
    caretColor: 'black',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text'
  };

  // Style for UI components to make them non-editable
  const uiComponentStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitUserModify: 'read-only',
    MozUserModify: 'read-only',
    msUserModify: 'read-only',
    cursor: 'default',
    pointerEvents: 'auto',
  };

  // Track if content is being updated programmatically
  const isUpdatingContent = useRef(false);

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current) {
      // Only update if this is a programmatic update, not a user edit
      isUpdatingContent.current = true;
      editorRef.current.innerHTML = content || "";
      isUpdatingContent.current = false;
      lastContentRef.current = content || "";
      
      // Force LTR direction directly
      editorRef.current.dir = "ltr";
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      
      // Add content protection
      startContentProtection();
    }
    
    return () => {
      if (protectContentTimer.current) {
        clearInterval(protectContentTimer.current);
      }
    };
  }, [content]);

  // Additional effect to protect toolbar and other UI elements
  useEffect(() => {
    // Make toolbar non-editable directly
    const protectUIElements = () => {
      // Get all toolbar and UI elements
      const uiElements = document.querySelectorAll('.editor-toolbar, .toolbar-button, .toolbar-divider, .toolbar-group');
      
      // Apply non-editable attributes to each
      uiElements.forEach(el => {
        // Ensure not contenteditable
        el.setAttribute('contenteditable', 'false');
        
        // Apply protective styles
        Object.assign(el.style, {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto',
          cursor: el.classList.contains('toolbar-button') ? 'pointer' : 'default'
        });
        
        // Add a listener to prevent any edit attempts
        el.addEventListener('input', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      });
    };
    
    // Run protection on mount and after any changes
    protectUIElements();
    
    // Set a timer to re-apply protection periodically
    const protectionInterval = setInterval(protectUIElements, 1000);
    
    return () => clearInterval(protectionInterval);
  }, []);

  // Content protection function to periodically verify content integrity
  const startContentProtection = () => {
    // Clear any existing timers
    if (protectContentTimer.current) {
      clearInterval(protectContentTimer.current);
    }
    
    // Check every 2 seconds if content was accidentally cleared and restore it
    protectContentTimer.current = setInterval(() => {
      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML.trim();
        
        // If editor is completely empty but we had content before, restore it
        if (!currentContent && lastContentRef.current.trim()) {
          console.log("Editor content was unexpectedly cleared, restoring...");
          isUpdatingContent.current = true;
          editorRef.current.innerHTML = lastContentRef.current;
          setEditorState(lastContentRef.current);
          isUpdatingContent.current = false;
          
          // Reapply formatting to ensure proper display
          applyFormattingToAllElements();
        }
      }
    }, 2000);
  };
  
  // Apply consistent formatting to all child elements
  const applyFormattingToAllElements = () => {
    if (!editorRef.current) return;
    
    const elements = editorRef.current.querySelectorAll('*');
    elements.forEach(el => {
      el.dir = "ltr";
      el.style.direction = "ltr";
      el.style.textAlign = "left";
      el.style.unicodeBidi = "isolate";
    });
  };

  // Save selection state
  const saveSelection = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastSelectionRef.current = range.cloneRange();
      }
    }
  };

  // Restore selection state
  const restoreSelection = () => {
    if (!lastSelectionRef.current || !editorRef.current) return;
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    
    try {
      selection.addRange(lastSelectionRef.current);
    } catch (error) {
      console.error("Failed to restore selection:", error);
    }
  };

  // Handle input changes
  const handleInput = () => {
    if (isUpdatingContent.current) return;

    if (editorRef.current) {
      saveSelection(); // Save current selection
      const newContent = editorRef.current.innerHTML;
      
      // Store last valid content if this isn't an accidental clear
      if (newContent.trim()) {
        lastContentRef.current = newContent;
      }
      
      setEditorState(newContent);
      onChange(newContent);
      
      // CRITICAL FIX: Force LTR direction on all elements after input
      editorRef.current.dir = "ltr";
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      editorRef.current.setAttribute('dir', 'ltr');
      
      // Force text node direction attributes to ensure proper cursor behavior
      const textNodes = [];
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      // Collect all text nodes (fixed for linter)
      let textNode = walker.nextNode();
      while (textNode) {
        textNodes.push(textNode);
        textNode = walker.nextNode();
      }
      
      // For each text node, ensure its parent has proper direction
      textNodes.forEach(textNode => {
        if (textNode.parentElement) {
          textNode.parentElement.dir = "ltr";
          textNode.parentElement.style.direction = "ltr";
          textNode.parentElement.style.textAlign = "left";
          textNode.parentElement.style.unicodeBidi = "isolate";
        }
      });
      
      // Apply to all child nodes
      applyFormattingToAllElements();
      
      // Ensure focus remains in editor with proper cursor position
      requestAnimationFrame(() => {
        // Force cursor to appear at selection point
        editorRef.current.focus();
        restoreSelection(); // Restore cursor position
      });
    }
  };

  // Apply formatting command with selection preservation
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    // Save selection before command
    saveSelection();
    
    // Focus the editor
    editorRef.current.focus();

    // Execute the command
    document.execCommand(command, false, value);
    
    // Update state and notify parent
    handleInput();
    
    // Ensure cursor position is restored after react updates
    requestAnimationFrame(() => {
      // Force LTR direction
      editorRef.current.dir = "ltr";
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      restoreSelection();
    });
  };

  // Insert link at the current selection
  const insertLink = (url) => {
    if (!url || !editorRef.current) return;
    saveSelection();
    editorRef.current.focus();
    document.execCommand('createLink', false, url);
    handleInput();
  };

  // Insert image at the current cursor position
  const insertImage = (url, alt = '') => {
    if (!url || !editorRef.current) return;
    saveSelection();
    editorRef.current.focus();
    
    // Create img element with attributes
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt || '';
    img.style.maxWidth = '100%';
    
    // Insert at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleInput();
  };

  // Insert a checkbox at the current cursor position
  const insertCheckbox = () => {
    if (!editorRef.current) return;
    saveSelection();
    editorRef.current.focus();
    
    // Create checkbox element
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'editor-checkbox';
    
    // Create label for the checkbox
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.contentEditable = 'true';
    label.textContent = 'Task item';
    
    // Create container
    const container = document.createElement('div');
    container.className = 'checkbox-container';
    container.appendChild(checkbox);
    container.appendChild(label);
    
    // Insert at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(container);
      
      // Move cursor after inserted checkbox
      range.setStartAfter(container);
      range.setEndAfter(container);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleInput();
  };

  // Insert a code block at the current cursor position
  const insertCodeBlock = () => {
    if (!editorRef.current) return;
    saveSelection();
    editorRef.current.focus();
    
    // Create pre and code elements
    const pre = document.createElement('pre');
    pre.className = 'editor-code-block';
    
    const code = document.createElement('code');
    code.textContent = 'Enter code here';
    pre.appendChild(code);
    
    // Insert at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(pre);
      
      // Select the text inside the code block
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    handleInput();
  };

  // Handle selection change
  const handleSelectionChange = () => {
    saveSelection();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    // Only show comment form if text is selected
    if (!selection.isCollapsed) {
      const start = getTextPosition(
        editorRef.current,
        range.startContainer,
        range.startOffset
      );
      
      const end = getTextPosition(
        editorRef.current,
        range.endContainer,
        range.endOffset
      );
      
      setSelectedRange({ start, end });
      setShowCommentForm(true);
    } else {
      setShowCommentForm(false);
    }
  };

  // Get position in text content (helper function)
  const getTextPosition = (editor, node, offset) => {
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let position = 0;
    let currentNode = walker.nextNode();

    while (currentNode && currentNode !== node) {
      position += currentNode.textContent.length;
      currentNode = walker.nextNode();
    }

    if (currentNode === node) {
      position += offset;
    }

    return position;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (readOnly) return;

    // Save selection on any key press
    saveSelection();

    // Force LTR direction - CRITICAL FIX
    // This ensures that even when typing non-English characters,
    // the text direction stays left-to-right
    if (editorRef.current) {
      requestAnimationFrame(() => {
        editorRef.current.dir = "ltr";
        editorRef.current.style.direction = "ltr";
        editorRef.current.style.textAlign = "left";
        
        // Force LTR on all child elements after each keystroke
        const elements = editorRef.current.querySelectorAll('*');
        elements.forEach(el => {
          el.dir = "ltr"; 
          el.style.direction = "ltr";
          el.style.textAlign = "left";
          el.style.unicodeBidi = "isolate";
        });
      });
    }

    // Implement keyboard shortcuts for common formatting commands
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
        default:
          break;
      }
    }
  };

  // Add comment
  const handleAddComment = () => {
    if (!commentText.trim() || !selectedRange) return;

    onAddComment(commentText, selectedRange);

    // Reset form
    setCommentText("");
    setShowCommentForm(false);
    
    // Restore focus to editor
    editorRef.current.focus();
    restoreSelection();
  };

  // Render comment indicators
  const renderCommentIndicators = () => {
    return comments.map((comment) => {
      const top = calculatePositionFromOffset(comment.range?.start || 0);
      return (
        <div
          key={comment.id || Math.random().toString(36).substring(2, 11)}
          className="comment-indicator"
          style={{ top: `${top}px` }}
          title={comment.text || "Comment"}
        >
          💬
        </div>
      );
    });
  };

  // Calculate visual position from text offset
  const calculatePositionFromOffset = (offset) => {
    if (!editorRef.current) return 0;
    
    const textContent = editorRef.current.textContent;
    if (!textContent) return 0;
    
    // Find the text node containing this offset
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node = null;
    let currentOffset = 0;
    let nodeFound = false;
    
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (currentOffset + nodeLength >= offset) {
        nodeFound = true;
        break;
      }
      currentOffset += nodeLength;
    }
    
    if (!nodeFound) return 0;
    
    // Calculate position within this node
    const range = document.createRange();
    range.setStart(node, Math.min(offset - currentOffset, node.textContent.length));
    range.collapse(true);
    
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    return rect.top - editorRect.top;
  };

  // Render remote user selections - simplified implementation
  const renderRemoteSelections = () => {
    // Simplified implementation that doesn't rely on unused variables
    return Object.entries(remoteSelections).map(([userId, selection]) => {
      if (!selection.range) return null;
      
      // Create a placeholder div for now
      return (
        <div
          key={userId}
          className="remote-selection"
          style={{
            position: 'absolute',
            backgroundColor: selection.color || "#ffcc00",
            opacity: 0.3
          }}
        />
      );
    });
  };

  // Focus event handler
  const handleFocus = () => {
    restoreSelection();
  };

  // Blur event handler
  const handleBlur = () => {
    saveSelection();
  };

  // Protection against pasting formatted content
  const handlePaste = (e) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert text at cursor position
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="text-editor-container">
      <div 
        ref={toolbarRef} 
        style={uiComponentStyle} 
        contentEditable={false} 
        onMouseDown={(e) => e.preventDefault()}
      >
        <EditorToolbar 
          execCommand={execCommand} 
          insertLink={insertLink}
          insertImage={insertImage}
          insertCheckbox={insertCheckbox}
          insertCodeBlock={insertCodeBlock}
          disabled={readOnly} 
        />
      </div>

      <div className="editor-wrapper">
        {/* Comment indicators in margin */}
        <div className="editor-margin">{renderCommentIndicators()}</div>

        {/* Remote selections */}
        <div className="remote-selections-container">
          {renderRemoteSelections()}
        </div>

        {/* Main editor content */}
        <div
          className={`editor-content ${readOnly ? "read-only" : ""}`}
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: editorState }}
          spellCheck="true"
          dir="ltr"
          style={forcedLTRStyle}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* Comment form */}
      {showCommentForm && (
        <div className="comment-form">
          <textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' }}
          ></textarea>
          <div className="comment-form-actions">
            <button onClick={() => {
              setShowCommentForm(false);
              editorRef.current.focus();
              restoreSelection();
            }}>Cancel</button>
            <button onClick={handleAddComment} disabled={!commentText.trim()}>
              Add Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
