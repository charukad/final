import React, { useState } from "react";

const InviteForm = ({ onInvite }) => {
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("view");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Submit invitation
    onInvite(email, permissionLevel);

    // Reset form
    setEmail("");
    setError("");
  };

  return (
    <form className="invite-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error ? "error" : ""}
        />

        <select
          value={permissionLevel}
          onChange={(e) => setPermissionLevel(e.target.value)}
        >
          <option value="view">Can view</option>
          <option value="comment">Can comment</option>
          <option value="edit">Can edit</option>
        </select>
      </div>

      <button type="submit" className="invite-button">
        Invite
      </button>
    </form>
  );
};

export default InviteForm;
