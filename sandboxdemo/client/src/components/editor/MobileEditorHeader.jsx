import React from "react";

const MobileEditorHeader = ({
  title,
  onTitleChange,
  saving,
  onSave,
  onBack,
  onOpenMenu,
}) => {
  return (
    <div className="mobile-editor-header">
      <button className="back-button" onClick={onBack}>
        ←
      </button>

      <div
        className="title-container"
        onClick={() => {
          const newTitle = prompt("Edit note title:", title);
          if (newTitle && newTitle.trim() !== "" && newTitle !== title) {
            onTitleChange(newTitle);
          }
        }}
      >
        <h1 className="note-title">{title}</h1>
        <span className="edit-icon">✎</span>
      </div>

      <div className="header-actions">
        <div className="save-status">
          {saving && <span className="saving-indicator">•</span>}
        </div>

        <button className="menu-button" onClick={onOpenMenu}>
          ⋮
        </button>
      </div>
    </div>
  );
};

export default MobileEditorHeader;
