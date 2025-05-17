import React from "react";
import { useNavigate } from "react-router-dom";
import { updateNote, trashNote } from "../../services/noteService";

const NoteList = ({
  notes,
  selectable = false,
  selectedNotes = [],
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

  // Handle click to open note
  const handleNoteClick = (noteId) => {
    // If in selection mode, toggle selection
    if (selectable && onSelect) {
      onSelect(noteId);
      return;
    }

    // Otherwise, navigate to note
    navigate(`/notes/${noteId}`);
  };

  // Toggle favorite status
  const handleToggleFavorite = async (e, noteId) => {
    e.stopPropagation(); // Prevent row click

    const note = notes.find((n) => n._id === noteId);
    if (!note) return;

    try {
      await updateNote(noteId, {
        isFavorite: !note.isFavorite,
      });
      // In a real app, you would update the state or refetch notes
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Check if a note is selected
  const isSelected = (noteId) => {
    return selectedNotes.includes(noteId);
  };

  return (
    <table className="notes-table">
      <thead>
        <tr>
          {selectable && <th className="select-col"></th>}
          <th className="favorite-col"></th>
          <th className="title-col">Title</th>
          <th className="updated-col">Last Updated</th>
          <th className="created-col">Created</th>
          {!selectable && <th className="actions-col"></th>}
        </tr>
      </thead>
      <tbody>
        {notes.map((note) => (
          <tr
            key={note._id}
            className={`note-row ${
              selectable && isSelected(note._id) ? "selected" : ""
            }`}
            onClick={() => handleNoteClick(note._id)}
          >
            {selectable && (
              <td className="select-cell">
                <div className="selection-checkbox">
                  {isSelected(note._id) ? "✓" : ""}
                </div>
              </td>
            )}
            <td className="favorite-cell">
              <button
                className={`favorite-button ${note.isFavorite ? "active" : ""}`}
                onClick={(e) => handleToggleFavorite(e, note._id)}
                title={
                  note.isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {note.isFavorite ? "★" : "☆"}
              </button>
            </td>
            <td className="title-cell">{note.title}</td>
            <td className="updated-cell">{formatDate(note.updatedAt)}</td>
            <td className="created-cell">{formatDate(note.createdAt)}</td>
            {!selectable && (
              <td className="actions-cell">
                <button
                  className="trash-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trashNote(note._id);
                  }}
                  title="Move to trash"
                >
                  🗑️
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NoteList;
