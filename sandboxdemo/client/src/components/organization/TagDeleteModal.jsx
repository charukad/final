import React, { useState } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "../../styles/Organization.css";

const TagDeleteModal = ({ tag, isOpen, onClose }) => {
  const { deleteTag } = useOrganization();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!tag) return;

    try {
      setIsDeleting(true);
      await deleteTag(tag._id);
      onClose();
    } catch (error) {
      console.error("Error deleting tag:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to delete tag. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  if (!isOpen || !tag) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Delete Tag</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p>
            Are you sure you want to delete the tag "<strong>{tag.name}</strong>
            "?
          </p>

          <p className="warning-text">
            This tag will be removed from all notes that use it.
          </p>

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
            {isDeleting ? "Deleting..." : "Delete Tag"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagDeleteModal;
