const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Comment schema
const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  position: {
    // Position in the document where the comment applies
    start: Number,
    end: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  resolvedAt: Date,
});

// Version history schema
const VersionSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: String, // Optional version name
  description: String, // Optional version description
});

// Collaborator schema
const CollaboratorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  permissionLevel: {
    type: String,
    enum: ["view", "comment", "edit"],
    default: "view",
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    images: [{
      path: {
        type: String,
        required: true
      },
      position: {
        type: Number,
        required: true
      }
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // New collaboration fields
    collaborators: [CollaboratorSchema],
    comments: [CommentSchema],
    versions: [VersionSchema],
    shareLink: {
      token: String,
      expiresAt: Date,
      hasPassword: Boolean,
      passwordHash: String,
    },
  },
  { timestamps: true }
);

// Add text index for search functionality
NoteSchema.index(
  { title: "text", content: "text" },
  { weights: { title: 10, content: 5 } }
);

module.exports = mongoose.model("Note", NoteSchema);
