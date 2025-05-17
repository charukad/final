import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import FolderModal from "../organization/FolderModal";
import TagModal from "../organization/TagModal";
import FolderDeleteModal from "../organization/FolderDeleteModal";
import TagDeleteModal from "../organization/TagDeleteModal";

const Sidebar = ({
  collapsed,
  toggleSidebar,
  activeFilter,
  onFilterChange,
}) => {
  const { currentUser } = useAuth();
  const { folders, tags, loading } = useOrganization();
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showFolderDeleteModal, setShowFolderDeleteModal] = useState(false);
  const [showTagDeleteModal, setShowTagDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    });
  };

  // Get child folders
  const getChildFolders = (parentId = null) => {
    return folders.filter(
      (folder) =>
        (parentId === null && !folder.parent) ||
        (folder.parent && folder.parent.toString() === parentId?.toString())
    );
  };

  // Open folder modal for editing
  const handleEditFolder = (e, folder) => {
    e.stopPropagation(); // Prevent selecting the folder
    setSelectedFolder(folder);
    setShowFolderModal(true);
  };

  // Open folder modal for creating
  const handleAddFolder = () => {
    setSelectedFolder(null);
    setShowFolderModal(true);
  };

  // Open delete confirmation for folder
  const handleDeleteFolder = (e, folder) => {
    e.stopPropagation(); // Prevent selecting the folder
    setSelectedFolder(folder);
    setShowFolderDeleteModal(true);
  };

  // Open tag modal for editing
  const handleEditTag = (e, tag) => {
    e.stopPropagation(); // Prevent selecting the tag
    setSelectedTag(tag);
    setShowTagModal(true);
  };

  // Open tag modal for creating
  const handleAddTag = () => {
    setSelectedTag(null);
    setShowTagModal(true);
  };

  // Open delete confirmation for tag
  const handleDeleteTag = (e, tag) => {
    e.stopPropagation(); // Prevent selecting the tag
    setSelectedTag(tag);
    setShowTagDeleteModal(true);
  };

  // Render folder structure recursively
  const renderFolders = (parentId = null) => {
    const childFolders = getChildFolders(parentId);

    if (childFolders.length === 0) {
      return null;
    }

    return (
      <ul className="folder-list">
        {childFolders.map((folder) => (
          <li key={folder._id} className="folder-item">
            <div className="folder-header">
              <button
                className={`folder-toggle ${
                  expandedFolders[folder._id] ? "expanded" : ""
                }`}
                onClick={() => toggleFolder(folder._id)}
              >
                {getChildFolders(folder._id).length > 0 ? (
                  expandedFolders[folder._id] ? (
                    "▼"
                  ) : (
                    "►"
                  )
                ) : (
                  <span className="folder-spacer"></span>
                )}
              </button>
              <div
                className={`folder-name ${
                  activeFilter === `folder-${folder._id}` ? "active" : ""
                }`}
                onClick={() => onFilterChange(`folder-${folder._id}`)}
              >
                <span
                  className="folder-color"
                  style={{ backgroundColor: folder.color || "#808080" }}
                ></span>
                <span className="folder-label">{folder.name}</span>
              </div>
              <div className="folder-actions">
                <button
                  className="folder-action edit"
                  onClick={(e) => handleEditFolder(e, folder)}
                  title="Edit Folder"
                >
                  ✎
                </button>
                <button
                  className="folder-action delete"
                  onClick={(e) => handleDeleteFolder(e, folder)}
                  title="Delete Folder"
                >
                  ×
                </button>
              </div>
            </div>

            {expandedFolders[folder._id] && renderFolders(folder._id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3 className="app-name">NoteFlow</h3>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Quick Note Button */}
      <button className="quick-note-button">
        <span className="icon">+</span>
        <span className="text">New Note</span>
      </button>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <a
              className={`nav-link ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => onFilterChange("all")}
            >
              <span className="icon">📄</span>
              <span className="text">All Notes</span>
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                activeFilter === "recent" ? "active" : ""
              }`}
              onClick={() => onFilterChange("recent")}
            >
              <span className="icon">🕒</span>
              <span className="text">Recent</span>
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                activeFilter === "favorites" ? "active" : ""
              }`}
              onClick={() => onFilterChange("favorites")}
            >
              <span className="icon">⭐</span>
              <span className="text">Favorites</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Folders Section */}
      <div className="sidebar-section">
        <div className="section-header">
          <h4>Folders</h4>
          <button
            className="section-action"
            onClick={handleAddFolder}
            title="Add Folder"
          >
            +
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : (
          renderFolders()
        )}
      </div>

      {/* Tags Section */}
      <div className="sidebar-section">
        <div className="section-header">
          <h4>Tags</h4>
          <button
            className="section-action"
            onClick={handleAddTag}
            title="Add Tag"
          >
            +
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : (
          <ul className="tag-list">
            {tags.map((tag) => (
              <li key={tag._id} className="tag-item">
                <div
                  className={`tag-link ${
                    activeFilter === `tag-${tag._id}` ? "active" : ""
                  }`}
                  onClick={() => onFilterChange(`tag-${tag._id}`)}
                >
                  <span
                    className="tag-color"
                    style={{ backgroundColor: tag.color || "#808080" }}
                  ></span>
                  <span className="tag-name">{tag.name}</span>
                </div>
                <div className="tag-actions">
                  <button
                    className="tag-action edit"
                    onClick={(e) => handleEditTag(e, tag)}
                    title="Edit Tag"
                  >
                    ✎
                  </button>
                  <button
                    className="tag-action delete"
                    onClick={(e) => handleDeleteTag(e, tag)}
                    title="Delete Tag"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}

            {tags.length === 0 && (
              <li className="empty-message">No tags created yet</li>
            )}
          </ul>
        )}
      </div>

      {/* Trash Link */}
      <div className="sidebar-footer">
        <a
          className={`nav-link ${activeFilter === "trash" ? "active" : ""}`}
          onClick={() => onFilterChange("trash")}
        >
          <span className="icon">🗑️</span>
          <span className="text">Trash</span>
        </a>
      </div>

      {/* Modals */}
      <FolderModal
        folder={selectedFolder}
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
      />

      <TagModal
        tag={selectedTag}
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
      />

      <FolderDeleteModal
        folder={selectedFolder}
        isOpen={showFolderDeleteModal}
        onClose={() => setShowFolderDeleteModal(false)}
      />

      <TagDeleteModal
        tag={selectedTag}
        isOpen={showTagDeleteModal}
        onClose={() => setShowTagDeleteModal(false)}
      />
    </div>
  );
};

export default Sidebar;
