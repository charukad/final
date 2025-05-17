import React, { useState } from "react";
import CollaboratorsList from "./CollaboratorsList";
import CommentsSection from "./CommentsSection";
import InviteForm from "./InviteForm";

const CollaborationPanel = ({
  note,
  comments,
  activeUsers,
  onResolveComment,
  onInviteCollaborator,
  onRemoveCollaborator,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("collaborators");

  return (
    <div className="collaboration-panel">
      <div className="panel-header">
        <h3>Collaboration</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-tabs">
        <button
          className={`tab-button ${
            activeTab === "collaborators" ? "active" : ""
          }`}
          onClick={() => setActiveTab("collaborators")}
        >
          Collaborators
        </button>
        <button
          className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          Comments {comments.length > 0 && `(${comments.length})`}
        </button>
      </div>

      <div className="panel-content">
        {activeTab === "collaborators" && (
          <>
            <CollaboratorsList
              collaborators={note.collaborators || []}
              activeUsers={activeUsers}
              onRemove={onRemoveCollaborator}
            />

            <div className="invite-section">
              <h4>Invite Collaborators</h4>
              <InviteForm onInvite={onInviteCollaborator} />
            </div>
          </>
        )}

        {activeTab === "comments" && (
          <CommentsSection comments={comments} onResolve={onResolveComment} />
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;
