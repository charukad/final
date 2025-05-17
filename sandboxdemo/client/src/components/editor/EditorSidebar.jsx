import React, { useState, useEffect } from "react";
import StyleChecker from "../common/StyleChecker";

const EditorSidebar = ({
  note = {}, // Default empty object to prevent errors
  onTagsChange = () => {}, // Default no-op function
  onFolderChange = () => {}, // Default no-op function
  onFavoriteChange = () => {}, // Default no-op function
  onBack = () => {}, // Default no-op function
  onClose = () => {}, // Default no-op function
  isMobile = false, // Default to desktop view
  className = "", // Accept className prop
  onMetadataChange = () => {}, // Combined metadata change handler
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [availableFolders, setAvailableFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tags and folders (in a real app, this would come from API)
  useEffect(() => {
    // Simulating API call
    const fetchTagsAndFolders = async () => {
      setLoading(true);
      try {
        // Mock data - in a real app, you would get this from an API
        setAvailableTags([
          { _id: "1", name: "Important", color: "#ff6b6b" },
          { _id: "2", name: "To-Do", color: "#51cf66" },
          { _id: "3", name: "Research", color: "#339af0" },
          { _id: "4", name: "Personal", color: "#ffa94d" },
        ]);

        setAvailableFolders([
          { _id: "1", name: "Personal" },
          { _id: "2", name: "Work" },
          { _id: "3", name: "Projects" },
          { _id: "4", name: "Meetings" },
          { _id: "5", name: "Ideas" },
          { _id: "6", name: "Travel" },
        ]);
      } catch (error) {
        console.error("Error fetching tags and folders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagsAndFolders();
  }, []);

  // Toggle a tag
  const toggleTag = (tagId) => {
    const currentTags = note.tags || [];
    let newTags;

    if (currentTags.includes(tagId)) {
      newTags = currentTags.filter((id) => id !== tagId);
    } else {
      newTags = [...currentTags, tagId];
    }

    onTagsChange(newTags);
    onMetadataChange({ tags: newTags });
  };

  // Change the folder
  const changeFolder = (folderId) => {
    onFolderChange(folderId || null);
    onMetadataChange({ folder: folderId || null });
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    const newValue = !(note.isFavorite || false);
    onFavoriteChange(newValue);
    onMetadataChange({ isFavorite: newValue });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    } catch {
      return "Invalid Date";
    }
  };

  // Minimalist sidebar for mobile or when features aren't needed
  if (isMobile) {
    return (
      <div className={`editor-sidebar mobile ${className}`}>
        <button className="back-button" onClick={onClose}>
          &larr; Close
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`editor-sidebar ${className}`}>
        <button className="back-button" onClick={onBack}>
          &larr; Back
        </button>
        <StyleChecker />
        <div className="sidebar-loading">
          <div className="loading-spinner small"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`editor-sidebar ${className}`}>
      <button className="back-button" onClick={onBack}>
        &larr; Back
      </button>
      
      <StyleChecker />
      
      <div className="sidebar-section">
        <h3>Note Info</h3>
        <div className="note-info">
          <div className="info-item">
            <span className="info-label">Created</span>
            <span className="info-value">{formatDate(note?.createdAt)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Updated</span>
            <span className="info-value">{formatDate(note?.updatedAt)}</span>
          </div>
          <div className="info-item favorite-toggle">
            <button
              className={`favorite-button large ${
                note?.isFavorite ? "active" : ""
              }`}
              onClick={toggleFavorite}
            >
              {note?.isFavorite ? "★ Favorited" : "☆ Add to Favorites"}
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Tags</h3>
        <div className="tags-list">
          {availableTags.map((tag) => (
            <div
              key={tag._id}
              className={`tag-item ${
                note?.tags && note.tags.includes(tag._id) ? "active" : ""
              }`}
              onClick={() => toggleTag(tag._id)}
            >
              <span
                className="tag-color"
                style={{ backgroundColor: tag.color }}
              ></span>
              <span className="tag-name">{tag.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Folder</h3>
        <select
          className="folder-select"
          value={note?.folder || ""}
          onChange={(e) => changeFolder(e.target.value)}
        >
          <option value="">None</option>
          {availableFolders.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <h3>Share</h3>
        <button className="share-button">Share Note</button>
      </div>
    </div>
  );
};

export default EditorSidebar;
