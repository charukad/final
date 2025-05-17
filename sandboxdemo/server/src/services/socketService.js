import { io } from "socket.io-client";

let socket;

// Initialize socket connection
export const initializeSocket = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("No authentication token found");
    return null;
  }

  socket = io("http://localhost:5000", {
    auth: { token },
  });

  // Handle connection events
  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error.message);
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a note editing session
export const joinNote = (noteId) => {
  const s = getSocket();
  if (s) {
    s.emit("join-note", noteId);
  }
};

// Leave a note editing session
export const leaveNote = (noteId) => {
  const s = getSocket();
  if (s) {
    s.emit("leave-note", noteId);
  }
};

// Send content changes
export const sendContentChange = (noteId, content, cursorPosition) => {
  const s = getSocket();
  if (s) {
    s.emit("content-change", { noteId, content, cursorPosition });
  }
};

// Send title changes
export const sendTitleChange = (noteId, title) => {
  const s = getSocket();
  if (s) {
    s.emit("title-change", { noteId, title });
  }
};

// Send cursor position
export const sendCursorPosition = (noteId, position, selection) => {
  const s = getSocket();
  if (s) {
    s.emit("cursor-position", { noteId, position, selection });
  }
};

// Add a comment
export const addComment = (noteId, text, position) => {
  const s = getSocket();
  if (s) {
    s.emit("add-comment", { noteId, text, position });
  }
};

// Resolve a comment
export const resolveComment = (noteId, commentId) => {
  const s = getSocket();
  if (s) {
    s.emit("resolve-comment", { noteId, commentId });
  }
};

// Invite a collaborator
export const inviteCollaborator = (noteId, email, permissionLevel) => {
  const s = getSocket();
  if (s) {
    s.emit("invite-collaborator", { noteId, email, permissionLevel });
  }
};

// Remove a collaborator
export const removeCollaborator = (noteId, userId) => {
  const s = getSocket();
  if (s) {
    s.emit("remove-collaborator", { noteId, userId });
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinNote,
  leaveNote,
  sendContentChange,
  sendTitleChange,
  sendCursorPosition,
  addComment,
  resolveComment,
  inviteCollaborator,
  removeCollaborator,
};
