import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { importFile, importFromClipboard } from "../../services/importService";

const ImportModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("file");
  const [file, setFile] = useState(null);
  const [clipboardText, setClipboardText] = useState("");
  const [clipboardTitle, setClipboardTitle] = useState("");
  const [clipboardFormat, setClipboardFormat] = useState("plain");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  };

  // Prevent default drag behavior
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle clipboard text change
  const handleClipboardTextChange = (e) => {
    setClipboardText(e.target.value);
  };

  // Handle clipboard title change
  const handleClipboardTitleChange = (e) => {
    setClipboardTitle(e.target.value);
  };

  // Handle clipboard format change
  const handleClipboardFormatChange = (e) => {
    setClipboardFormat(e.target.value);
  };

  // Handle paste button click
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setError("Unable to access clipboard. Please paste text manually.");
    }
  };

  // Handle import button click
  const handleImport = async () => {
    setLoading(true);
    setError("");
    setImportResult(null);

    try {
      let result;

      if (activeTab === "file") {
        if (!file) {
          setError("Please select a file to import");
          setLoading(false);
          return;
        }

        result = await importFile(file);
      } else {
        if (!clipboardText.trim()) {
          setError("Please enter or paste some text to import");
          setLoading(false);
          return;
        }

        result = await importFromClipboard(
          clipboardText,
          clipboardFormat,
          clipboardTitle.trim() || "Imported Note"
        );
      }

      setImportResult(result);

      // Reset form
      setFile(null);
      setClipboardText("");
      setClipboardTitle("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Import failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle "View Note" button click
  const handleViewNote = () => {
    if (importResult && importResult.note && importResult.note._id) {
      navigate(`/notes/${importResult.note._id}`);
      onClose();
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Import Content</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === "file" ? "active" : ""}`}
            onClick={() => handleTabChange("file")}
          >
            From File
          </button>
          <button
            className={`tab-button ${
              activeTab === "clipboard" ? "active" : ""
            }`}
            onClick={() => handleTabChange("clipboard")}
          >
            From Clipboard
          </button>
        </div>

        <div className="modal-content">
          {importResult ? (
            <div className="import-success">
              <div className="success-icon">✓</div>
              <h4>Import Successful</h4>
              <p>{importResult.message}</p>
              <p>
                Note "<strong>{importResult.note.title}</strong>" has been
                created.
              </p>
              <button className="view-note-button" onClick={handleViewNote}>
                View Note
              </button>
              <button
                className="import-another-button"
                onClick={() => setImportResult(null)}
              >
                Import Another
              </button>
            </div>
          ) : (
            <>
              {activeTab === "file" ? (
                <div className="file-import-tab">
                  <div
                    className={`file-drop-area ${file ? "has-file" : ""}`}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    {file ? (
                      <div className="selected-file">
                        <div className="file-icon">📄</div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                        <button
                          className="remove-file-button"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="drop-icon">📁</div>
                        <p>Drag and drop a file here or</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="file-input"
                          accept=".txt,.md,.html,.docx,.zip,.json"
                        />
                        <button
                          className="browse-button"
                          onClick={() => fileInputRef.current.click()}
                        >
                          Browse Files
                        </button>
                      </>
                    )}
                  </div>

                  <div className="supported-formats">
                    <h4>Supported Formats</h4>
                    <ul>
                      <li>Text files (.txt)</li>
                      <li>Markdown files (.md)</li>
                      <li>HTML documents (.html)</li>
                      <li>Word documents (.docx)</li>
                      <li>JSON files (.json)</li>
                      <li>ZIP archives containing notes</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="clipboard-import-tab">
                  <div className="form-group">
                    <label htmlFor="clipboard-title">Note Title</label>
                    <input
                      type="text"
                      id="clipboard-title"
                      value={clipboardTitle}
                      onChange={handleClipboardTitleChange}
                      placeholder="Enter a title for the note"
                    />
                  </div>

                  <div className="form-group">
                    <div className="textarea-header">
                      <label htmlFor="clipboard-text">Content</label>
                      <button
                        type="button"
                        className="paste-button"
                        onClick={handlePaste}
                      >
                        Paste from Clipboard
                      </button>
                    </div>
                    <textarea
                      id="clipboard-text"
                      value={clipboardText}
                      onChange={handleClipboardTextChange}
                      placeholder="Enter or paste the content to import"
                      rows={10}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="clipboard-format">Content Format</label>
                    <select
                      id="clipboard-format"
                      value={clipboardFormat}
                      onChange={handleClipboardFormatChange}
                    >
                      <option value="plain">Plain Text</option>
                      <option value="markdown">Markdown</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          {!importResult && (
            <button
              className="import-button"
              onClick={handleImport}
              disabled={
                loading ||
                (activeTab === "file" && !file) ||
                (activeTab === "clipboard" && !clipboardText.trim())
              }
            >
              {loading ? "Importing..." : "Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
