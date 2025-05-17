import React, { useState } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "../../styles/Organization.css";

const FolderDeleteModal = ({ folder, isOpen, onClose }) => {
  const { deleteFolder } = useOrganization();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!folder) return;

    try {
      setIsDeleting(true);
      await deleteFolder(folder._id);
      onClose();
    } catch (error) {
      console.error("Error deleting folder:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to delete folder. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  if (!isOpen || !folder) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Delete Folder</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p>
            Are you sure you want to delete the folder "
            <strong>{folder.name}</strong>"?
          </p>

          <p className="warning-text">This action cannot be undone.</p>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderDeleteModal;
