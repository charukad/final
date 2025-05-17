const Note = require("../models/Note");
const User = require("../models/User");

module.exports = (io, socket) => {
  // Add comment to note
  socket.on("add_comment", async (data) => {
    const { noteId, text, position } = data;

    try {
      // Get the note
      const note = await Note.findById(noteId);

      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      // Create new comment
      const comment = {
        user: socket.user.id,
        userName: socket.user.name,
        text,
        position,
        timestamp: new Date(),
      };

      // Add comment to the note
      note.comments = note.comments || [];
      note.comments.push(comment);
      await note.save();

      // Broadcast comment to all clients in the room
      io.to(noteId).emit("comment-added", {
        id: comment._id,
        userId: socket.user.id,
        userName: socket.user.name,
        text,
        position,
        timestamp: comment.timestamp,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      socket.emit("error", { message: "Failed to add comment" });
    }
  });

  // Resolve comment
  socket.on("resolve_comment", async (data) => {
    const { noteId, commentId } = data;

    try {
      // Update the comment in the database
      const note = await Note.findOneAndUpdate(
        { _id: noteId, "comments._id": commentId },
        {
          $set: {
            "comments.$.resolved": true,
            "comments.$.resolvedBy": socket.user.id,
            "comments.$.resolvedAt": new Date(),
          },
        },
        { new: true }
      );

      if (!note) {
        socket.emit("error", { message: "Note or comment not found" });
        return;
      }

      // Broadcast to all clients in the room
      io.to(noteId).emit("comment-resolved", {
        commentId,
        resolvedBy: socket.user.name,
        resolvedAt: new Date(),
      });
    } catch (error) {
      console.error("Error resolving comment:", error);
      socket.emit("error", { message: "Failed to resolve comment" });
    }
  });

  // Invite user to collaborate
  socket.on("invite_collaborator", async (data) => {
    const { noteId, email, permissionLevel } = data;

    try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
        socket.emit("error", { message: "User not found" });
        return;
      }

      // Check if user already has access
      const note = await Note.findById(noteId);

      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      if (note.user.toString() === user._id.toString()) {
        socket.emit("error", {
          message: "User is already the owner of this note",
        });
        return;
      }

      // Check if user is already a collaborator
      const existingCollaborator =
        note.collaborators &&
        note.collaborators.find(
          (c) => c.user.toString() === user._id.toString()
        );

      if (existingCollaborator) {
        // Update permission level if different
        if (existingCollaborator.permissionLevel !== permissionLevel) {
          await Note.updateOne(
            { _id: noteId, "collaborators.user": user._id },
            { $set: { "collaborators.$.permissionLevel": permissionLevel } }
          );

          socket.emit("collaborator-updated", {
            userId: user._id,
            userName: user.fullName,
            email: user.email,
            permissionLevel,
          });
        } else {
          socket.emit("error", {
            message:
              "User is already a collaborator with this permission level",
          });
        }
        return;
      }

      // Add collaborator
      await Note.updateOne(
        { _id: noteId },
        {
          $push: {
            collaborators: {
              user: user._id,
              permissionLevel,
              addedBy: socket.user.id,
              addedAt: new Date(),
            },
          },
        }
      );

      // Emit success event
      socket.emit("collaborator-added", {
        userId: user._id,
        userName: user.fullName,
        email: user.email,
        permissionLevel,
      });

      // Broadcast to all clients in the room
      socket.to(noteId).emit("collaborator-joined", {
        userId: user._id,
        userName: user.fullName,
        permissionLevel,
      });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      socket.emit("error", { message: "Failed to invite collaborator" });
    }
  });

  // Remove collaborator
  socket.on("remove_collaborator", async (data) => {
    const { noteId, userId } = data;

    try {
      // Get the note
      const note = await Note.findById(noteId);

      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      // Only the owner can remove collaborators
      if (note.user.toString() !== socket.user.id) {
        socket.emit("error", {
          message: "Only the owner can remove collaborators",
        });
        return;
      }

      // Remove collaborator
      await Note.updateOne(
        { _id: noteId },
        { $pull: { collaborators: { user: userId } } }
      );

      // Emit success event
      socket.emit("collaborator-removed", { userId });

      // Broadcast to all clients in the room
      socket.to(noteId).emit("collaborator-removed", { userId });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      socket.emit("error", { message: "Failed to remove collaborator" });
    }
  });
};
