const Note = require("../models/Note");

module.exports = (io, socket) => {
  // Join a note's editing session
  socket.on("join_note", async (data) => {
    try {
      const noteId = data.noteId;
      
      // Check if user has access to this note
      const note = await Note.findOne({
        _id: noteId,
        $or: [
          { user: socket.user.id }, // User is the owner
          { "collaborators.user": socket.user.id }, // User is a collaborator
        ],
      });

      if (!note) {
        socket.emit("error", { message: "Access denied to this note" });
        return;
      }

      // Join the note's room
      socket.join(noteId);

      // Notify other users in the room
      socket.to(noteId).emit("user-joined", {
        userId: socket.user.id,
        userName: socket.user.name,
      });

      // Send list of active users to the newly joined user
      const roomSockets = await io.in(noteId).fetchSockets();
      const activeUsers = roomSockets
        .filter((s) => s.id !== socket.id) // Exclude current user
        .map((s) => ({
          userId: s.user.id,
          userName: s.user.name,
        }));

      socket.emit("active-users", activeUsers);

      console.log(`${socket.user.name} joined note: ${noteId}`);
    } catch (error) {
      console.error("Error joining note:", error);
      socket.emit("error", { message: "Failed to join note session" });
    }
  });

  // Leave note editing session
  socket.on("leave_note", (data) => {
    const noteId = data.noteId;
    socket.leave(noteId);

    // Notify others that user has left
    socket.to(noteId).emit("user-left", {
      userId: socket.user.id,
      userName: socket.user.name,
    });

    console.log(`${socket.user.name} left note: ${noteId}`);
  });

  // Handle content changes
  socket.on("content_changes", (data) => {
    const { noteId, content, position } = data;

    // Broadcast changes to all clients in the room except sender
    socket.to(noteId).emit("content-changed", {
      userId: socket.user.id,
      userName: socket.user.name,
      content,
      position,
    });
  });

  // Handle title changes
  socket.on("title_changed", (data) => {
    const { noteId, title } = data;

    // Broadcast title change to all clients in the room except sender
    socket.to(noteId).emit("title-changed", {
      userId: socket.user.id,
      userName: socket.user.name,
      title,
    });
  });

  // Handle cursor position changes
  socket.on("cursor_position", (data) => {
    const { noteId, position, selection } = data;

    // Broadcast cursor position to all clients in the room except sender
    socket.to(noteId).emit("cursor-moved", {
      userId: socket.user.id,
      userName: socket.user.name,
      position,
      selection,
    });
  });
};
