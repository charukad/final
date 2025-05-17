import React, { useState } from "react";
import { exportNote, exportNotes } from "../../services/exportService";

const ExportModal = ({ isOpen, onClose, note = null, selectedNotes = [] }) => {
  const [format, setFormat] = useState("pdf");
  const [subFormat, setSubFormat] = useState("html");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine if we're exporting a single note or multiple notes
  const isSingleNote = note !== null;
  const notesToExport = isSingleNote ? [note._id] : selectedNotes;

  // Check if we have any notes to export
  const hasNotes = isSingleNote || selectedNotes.length > 0;

  // Handle format change
  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  // Handle sub-format change (for zip exports)
  const handleSubFormatChange = (e) => {
    setSubFormat(e.target.value);
  };

  // Handle export button click
  const handleExport = async () => {
    if (!hasNotes) {
      setError("No notes selected for export");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;

      if (isSingleNote) {
        // Export single note
        result = await exportNote(note._id, format);
      } else {
        // Export multiple notes
        result = await exportNotes(
          selectedNotes,
          format,
          format === "zip" ? subFormat : null
        );
      }

      if (result.success) {
        // Close modal on success
        onClose();
      } else {
        setError("Export failed. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Export {isSingleNote ? "Note" : "Notes"}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {!hasNotes ? (
            <div className="error-message">No notes selected for export</div>
          ) : (
            <>
              <div className="export-info">
                {isSingleNote ? (
                  <p>
                    Exporting: <strong>{note.title}</strong>
                  </p>
                ) : (
                  <p>
                    Exporting <strong>{selectedNotes.length}</strong> selected
                    notes
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="export-format">Export Format</label>
                <select
                  id="export-format"
                  value={format}
                  onChange={handleFormatChange}
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="html">HTML Document (.html)</option>
                  <option value="txt">Plain Text (.txt)</option>
                  {!isSingleNote && (
                    <option value="zip">Zip Archive (.zip)</option>
                  )}
                </select>
              </div>

              {format === "zip" && !isSingleNote && (
                <div className="form-group">
                  <label htmlFor="sub-format">File Format Inside Zip</label>
                  <select
                    id="sub-format"
                    value={subFormat}
                    onChange={handleSubFormatChange}
                  >
                    <option value="html">HTML Documents</option>
                    <option value="markdown">Markdown Files</option>
                    <option value="txt">Plain Text Files</option>
                  </select>
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
          <button
            className="export-button"
            onClick={handleExport}
            disabled={loading || !hasNotes}
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
