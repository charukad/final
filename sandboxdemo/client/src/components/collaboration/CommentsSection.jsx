import React from "react";

const CommentsSection = ({ comments, onResolve }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>

      {comments.length === 0 ? (
        <p className="no-comments">
          No comments yet. Highlight text in the editor to add a comment.
        </p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-item ${comment.resolved ? "resolved" : ""}`}
            >
              <div className="comment-header">
                <span className="comment-author">{comment.userName}</span>
                <span className="comment-time">
                  {formatDate(comment.timestamp)}
                </span>
              </div>

              <div className="comment-text">{comment.text}</div>

              {comment.position && (
                <div className="comment-position">
                  <span className="position-label">At:</span>
                  <span className="position-value">
                    {comment.position.start} - {comment.position.end}
                  </span>
                </div>
              )}

              {comment.resolved ? (
                <div className="resolution-info">
                  <span className="resolved-label">Resolved by:</span>
                  <span className="resolved-by">{comment.resolvedBy}</span>
                  <span className="resolved-time">
                    {formatDate(comment.resolvedAt)}
                  </span>
                </div>
              ) : (
                <button
                  className="resolve-button"
                  onClick={() => onResolve(comment.id)}
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
