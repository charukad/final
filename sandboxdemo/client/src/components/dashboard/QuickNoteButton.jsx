import React from "react";
import { useNavigate } from "react-router-dom";

const QuickNoteButton = () => {
  const navigate = useNavigate();

  const createNewNote = () => {
    // In a real app, this would call an API to create a new note
    // and then navigate to the note editor
    navigate("/notes/new");
  };

  return (
    <div className="quick-note-card" onClick={createNewNote}>
      <div className="quick-note-content">
        <span className="plus-icon">+</span>
        <span className="new-note-text">Create New Note</span>
      </div>
    </div>
  );
};

export default QuickNoteButton;
