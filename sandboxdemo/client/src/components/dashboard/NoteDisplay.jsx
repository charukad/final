import React, { useState, useEffect } from "react";
import NoteCard from "./NoteCard";
import NoteList from "./NoteList";
import QuickNoteButton from "./QuickNoteButton";
import DashboardActions from "./DashboardActions";
import { getNotes } from "../../services/noteService";

const NoteDisplay = ({ view, searchQuery, activeFilter }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);

  // Convert activeFilter to API filters
  const getFiltersFromActiveFilter = () => {
    const filters = { search: searchQuery };

    if (activeFilter === "favorites") {
      filters.favorite = true;
    } else if (activeFilter === "trash") {
      filters.deleted = true;
    } else if (activeFilter.startsWith("folder-")) {
      filters.folder = activeFilter.split("-")[1];
    } else if (activeFilter.startsWith("tag-")) {
      filters.tag = activeFilter.split("-")[1];
    }

    return filters;
  };

  // Fetch notes from API based on filters
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const filters = getFiltersFromActiveFilter();
        const fetchedNotes = await getNotes(filters);
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to load notes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [searchQuery, activeFilter]);

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotes([]);
  };

  // Toggle note selection
  const toggleNoteSelection = (noteId) => {
    setSelectedNotes((prevSelected) => {
      if (prevSelected.includes(noteId)) {
        return prevSelected.filter((id) => id !== noteId);
      } else {
        return [...prevSelected, noteId];
      }
    });
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedNotes([]);
    setIsSelectionMode(false);
  };

  // Select all notes
  const selectAllNotes = () => {
    setSelectedNotes(notes.map((note) => note._id));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="notes-loading">
        <div className="loading-spinner"></div>
        <p>Loading notes...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="notes-error">
        <p>{error}</p>
        <button className="button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Render empty state
  if (notes.length === 0) {
    return (
      <div className="notes-empty">
        <div className="empty-illustration">📝</div>
        <h3>No Notes Found</h3>
        <p>
          {searchQuery
            ? `No notes match your search for "${searchQuery}"`
            : activeFilter === "trash"
            ? "Your trash is empty"
            : "Create your first note to get started!"}
        </p>
        {activeFilter !== "trash" && <QuickNoteButton />}
      </div>
    );
  }

  // Render notes based on selected view
  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="notes-title-section">
          <h2>
            {activeFilter === "all"
              ? "All Notes"
              : activeFilter === "recent"
              ? "Recent Notes"
              : activeFilter === "favorites"
              ? "Favorite Notes"
              : activeFilter === "trash"
              ? "Trash"
              : activeFilter.startsWith("folder-")
              ? "Folder Notes"
              : activeFilter.startsWith("tag-")
              ? "Tagged Notes"
              : "Notes"}
          </h2>
          <span className="note-count">{notes.length} notes</span>
        </div>

        <div className="notes-actions">
          <button
            className={`selection-toggle ${isSelectionMode ? "active" : ""}`}
            onClick={toggleSelectionMode}
            title={
              isSelectionMode ? "Exit selection mode" : "Enter selection mode"
            }
          >
            {isSelectionMode ? "Cancel Selection" : "Select Notes"}
          </button>

          {isSelectionMode && (
            <button
              className="select-all"
              onClick={selectAllNotes}
              title="Select all notes"
            >
              Select All
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Actions */}
      <DashboardActions
        selectedNotes={selectedNotes}
        onClearSelection={clearSelection}
      />

      {view === "grid" ? (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              selectable={isSelectionMode}
              selected={selectedNotes.includes(note._id)}
              onSelect={toggleNoteSelection}
            />
          ))}
          {activeFilter !== "trash" && !isSelectionMode && <QuickNoteButton />}
        </div>
      ) : (
        <div className="notes-list">
          <NoteList
            notes={notes}
            selectable={isSelectionMode}
            selectedNotes={selectedNotes}
            onSelect={toggleNoteSelection}
          />
          {activeFilter !== "trash" && !isSelectionMode && <QuickNoteButton />}
        </div>
      )}
    </div>
  );
};

export default NoteDisplay;
