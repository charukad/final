import React, { useState, useEffect } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import "../../styles/Organization.css";

const TagModal = ({ tag = null, isOpen, onClose }) => {
  const { createTag, updateTag } = useOrganization();
  const [formData, setFormData] = useState({
    name: "",
    color: "#808080",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens or tag changes
  useEffect(() => {
    if (isOpen) {
      if (tag) {
        setFormData({
          name: tag.name || "",
          color: tag.color || "#808080",
        });
      } else {
        setFormData({
          name: "",
          color: "#808080",
        });
      }
      setError("");
    }
  }, [isOpen, tag]);

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
      setError("Tag name is required");
      return;
    }

    try {
      setIsSaving(true);

      if (tag) {
        // Update existing tag
        await updateTag(tag._id, formData);
      } else {
        // Create new tag
        await createTag(formData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving tag:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to save tag. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{tag ? "Edit Tag" : "Create New Tag"}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Tag Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tag name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Tag Color</label>
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
              {isSaving ? "Saving..." : tag ? "Update Tag" : "Create Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagModal;
