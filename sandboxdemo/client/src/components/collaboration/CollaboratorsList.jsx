import React from "react";

const CollaboratorsList = ({ collaborators, activeUsers, onRemove }) => {
  // Helper function to check if user is active
  const isUserActive = (userId) => {
    return activeUsers.some((user) => user.userId === userId);
  };

  return (
    <div className="collaborators-list">
      <h4>Current Collaborators</h4>

      {collaborators.length === 0 ? (
        <p className="no-collaborators">
          No collaborators yet. Invite someone to collaborate!
        </p>
      ) : (
        <ul className="collaborators">
          {collaborators.map((collaborator) => (
            <li key={collaborator.user._id} className="collaborator-item">
              <div className="collaborator-info">
                <span
                  className={`user-status ${
                    isUserActive(collaborator.user._id) ? "active" : "inactive"
                  }`}
                ></span>
                <span className="user-name">{collaborator.user.fullName}</span>
                <span className="permission-level">
                  {collaborator.permissionLevel}
                </span>
              </div>

              <button
                className="remove-button"
                onClick={() => onRemove(collaborator.user._id)}
                title="Remove collaborator"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollaboratorsList;
