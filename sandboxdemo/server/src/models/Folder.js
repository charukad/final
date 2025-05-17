const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FolderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    color: {
      type: String,
      default: "#808080",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", FolderSchema);
