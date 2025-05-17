import React, { useState } from "react";
import ExportModal from "../export/ExportModal";
import ImportModal from "../import/ImportModal";

const DashboardActions = ({ selectedNotes = [], onClearSelection }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Check if any notes are selected
  const hasSelectedNotes = selectedNotes.length > 0;

  // Handle export button click
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Handle import button click
  const handleImport = () => {
    setShowImportModal(true);
  };

  return (
    <div className="dashboard-actions">
      <button
        className="action-button import"
        onClick={handleImport}
        title="Import content"
      >
        <span className="action-icon">📥</span>
        <span className="action-text">Import</span>
      </button>

      <button
        className="action-button export"
        onClick={handleExport}
        disabled={!hasSelectedNotes}
        title={
          hasSelectedNotes ? "Export selected notes" : "Select notes to export"
        }
      >
        <span className="action-icon">📤</span>
        <span className="action-text">Export</span>
        {hasSelectedNotes && (
          <span className="selection-count">{selectedNotes.length}</span>
        )}
      </button>

      {hasSelectedNotes && (
        <button
          className="action-button clear-selection"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <span className="action-icon">✕</span>
          <span className="action-text">Clear Selection</span>
        </button>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedNotes={selectedNotes}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default DashboardActions;
