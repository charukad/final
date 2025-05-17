import React from "react";
import { useOrganization } from "../../contexts/OrganizationContext";

const MobileSidebar = ({ isOpen, onClose, activeFilter, onFilterChange }) => {
  const { folders, tags, loading } = useOrganization();

  // Handle filter change and close sidebar
  const handleFilterChange = (filter) => {
    onFilterChange(filter);
    onClose();
  };

  // Render folders as a flat list for mobile
  const renderFolders = () => {
    const allFolders = [...folders];

    // Sort by name
    allFolders.sort((a, b) => a.name.localeCompare(b.name));

    return (
      <ul className="mobile-folder-list">
        {allFolders.map((folder) => (
          <li key={folder._id} className="mobile-folder-item">
            <div
              className={`mobile-folder-name ${
                activeFilter === `folder-${folder._id}` ? "active" : ""
              }`}
              onClick={() => handleFilterChange(`folder-${folder._id}`)}
            >
              <span
                className="folder-color"
                style={{ backgroundColor: folder.color || "#808080" }}
              ></span>
              <span className="folder-label">{folder.name}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">NoteFlow</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <a
                className={`mobile-nav-link ${
                  activeFilter === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
              >
                <span className="nav-icon">📄</span>
                <span className="nav-text">All Notes</span>
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                className={`mobile-nav-link ${
                  activeFilter === "recent" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("recent")}
              >
                <span className="nav-icon">🕒</span>
                <span className="nav-text">Recent</span>
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                className={`mobile-nav-link ${
                  activeFilter === "favorites" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("favorites")}
              >
                <span className="nav-icon">⭐</span>
                <span className="nav-text">Favorites</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h4 className="section-title">Folders</h4>
          {loading ? (
            <div className="loading-indicator">Loading...</div>
          ) : (
            renderFolders()
          )}
        </div>

        <div className="sidebar-section">
          <h4 className="section-title">Tags</h4>
          {loading ? (
            <div className="loading-indicator">Loading...</div>
          ) : (
            <div className="mobile-tags-grid">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className={`mobile-tag ${
                    activeFilter === `tag-${tag._id}` ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange(`tag-${tag._id}`)}
                >
                  <span
                    className="tag-color"
                    style={{ backgroundColor: tag.color || "#808080" }}
                  ></span>
                  <span className="tag-name">{tag.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <a
            className={`mobile-nav-link ${
              activeFilter === "trash" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("trash")}
          >
            <span className="nav-icon">🗑️</span>
            <span className="nav-text">Trash</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
