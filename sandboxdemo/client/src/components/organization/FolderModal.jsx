import React, { useState, useEffect } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "../../styles/Organization.css";

const FolderModal = ({ folder = null, isOpen, onClose }) => {
  const { folders, createFolder, updateFolder } = useOrganization();
  const [formData, setFormData] = useState({
    name: "",
    parent: "",
    color: "#808080",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens or folder changes
  useEffect(() => {
    if (isOpen) {
      if (folder) {
        setFormData({
          name: folder.name || "",
          parent: folder.parent || "",
          color: folder.color || "#808080",
        });
      } else {
        setFormData({
          name: "",
          parent: "",
          color: "#808080",
        });
      }
      setError("");
    }
  }, [isOpen, folder]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      setError("Folder name is required");
      return;
    }

    try {
      setIsSaving(true);

      if (folder) {
        // Update existing folder
        await updateFolder(folder._id, formData);
      } else {
        // Create new folder
        await createFolder(formData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving folder:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to save folder. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Get parent folder options, excluding the current folder and its descendants
  const getParentOptions = () => {
    if (!folder) {
      return folders;
    }

    // Helper function to get all descendant folder IDs
    const getDescendantIds = (folderId) => {
      const result = [folderId];

      for (const f of folders) {
        if (f.parent === folderId) {
          result.push(...getDescendantIds(f._id));
        }
      }

      return result;
    };

    const excludeIds = getDescendantIds(folder._id);

    return folders.filter((f) => !excludeIds.includes(f._id));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{folder ? "Edit Folder" : "Create New Folder"}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Folder Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter folder name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent">Parent Folder (Optional)</label>
            <select
              id="parent"
              name="parent"
              value={formData.parent}
              onChange={handleChange}
            >
              <option value="">None (Root Level)</option>
              {getParentOptions().map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="color">Folder Color</label>
            <div className="color-picker">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
              <span className="color-value">{formData.color}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : folder
                ? "Update Folder"
                : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;
