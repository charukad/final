import React from "react";
import { useNavigate } from "react-router-dom";
import { updateNote, trashNote } from "../../services/noteService";

const NoteCard = ({
  note,
  selectable = false,
  selected = false,
  onSelect = null,
}) => {
  const navigate = useNavigate();

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate preview text (limited characters)
  const getPreviewText = (content, maxLength = 120) => {
    // Remove HTML tags for preview
    const plainText = content.replace(/<[^>]*>/g, "");
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  // Handle click to open note
  const handleNoteClick = (e) => {
    // If in selection mode, toggle selection
    if (selectable && onSelect) {
      onSelect(note._id);
      return;
    }

    // Otherwise, navigate to note
    navigate(`/notes/${note._id}`);
  };

  // Toggle favorite status
  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card click
    try {
      await updateNote(note._id, {
        isFavorite: !note.isFavorite,
      });
      // In a real app, you would update the state or refetch notes
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Move note to trash
  const handleTrash = async (e) => {
    e.stopPropagation(); // Prevent card click
    try {
      await trashNote(note._id);
      // In a real app, you would update the state or refetch notes
    } catch (error) {
      console.error("Error trashing note:", error);
    }
  };

  return (
    <div
      className={`note-card ${selectable ? "selectable" : ""} ${
        selected ? "selected" : ""
      }`}
      onClick={handleNoteClick}
    >
      {selectable && (
        <div className="selection-indicator">{selected ? "✓" : ""}</div>
      )}

      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <button
          className={`favorite-button ${note.isFavorite ? "active" : ""}`}
          onClick={handleToggleFavorite}
          title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {note.isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="note-preview">{getPreviewText(note.content)}</div>

      <div className="note-footer">
        <div className="note-tags">
          {note.tags && note.tags.length > 0 && (
            <span className="tag-count">
              {note.tags.length} tag{note.tags.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="note-date">Updated {formatDate(note.updatedAt)}</div>
      </div>

      {!note.isDeleted && !selectable && (
        <div className="note-actions">
          <button
            className="trash-button"
            onClick={handleTrash}
            title="Move to trash"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
