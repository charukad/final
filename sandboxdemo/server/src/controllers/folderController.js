const Folder = require("../models/Folder");
const Note = require("../models/Note");

// Get all folders for the current user
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).sort({ name: 1 });

    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Server error while fetching folders" });
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parent, color } = req.body;

    // Validate folder name
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name is required" });
    }

    // Check if folder with same name already exists at the same level
    const existingFolder = await Folder.findOne({
      user: req.user.id,
      name: name.trim(),
      parent: parent || null,
    });

    if (existingFolder) {
      return res
        .status(400)
        .json({ message: "A folder with this name already exists" });
    }

    // Create new folder
    const folder = new Folder({
      name: name.trim(),
      user: req.user.id,
      parent: parent || null,
      color: color || "#808080",
    });

    await folder.save();

    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Server error while creating folder" });
  }
};

// Update folder
exports.updateFolder = async (req, res) => {
  try {
    const { name, parent, color } = req.body;

    // Find folder and check ownership
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if new name conflicts with existing folder
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({
        user: req.user.id,
        name: name.trim(),
        parent: parent || folder.parent || null,
        _id: { $ne: folder._id }, // Exclude current folder
      });

      if (existingFolder) {
        return res
          .status(400)
          .json({ message: "A folder with this name already exists" });
      }

      folder.name = name.trim();
    }

    // Check if moving folder would create a cycle
    if (parent && parent !== folder.parent) {
      // Check that the parent folder isn't a descendant of this folder
      const isDescendant = await checkIfDescendant(folder._id, parent);

      if (isDescendant) {
        return res
          .status(400)
          .json({ message: "Cannot move a folder into its own descendant" });
      }

      folder.parent = parent;
    }

    if (color) {
      folder.color = color;
    }

    await folder.save();

    res.json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Server error while updating folder" });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    // Find folder and check ownership
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Get all descendant folders (recursive)
    const descendantFolders = await getDescendantFolders(folder._id);
    const folderIds = [folder._id, ...descendantFolders];

    // Check if folder has notes
    const noteCount = await Note.countDocuments({
      folder: { $in: folderIds },
      user: req.user.id,
    });

    if (noteCount > 0) {
      return res.status(400).json({
        message: "Cannot delete folder with notes. Move or delete notes first.",
        noteCount,
      });
    }

    // Delete all descendant folders
    await Folder.deleteMany({ _id: { $in: descendantFolders } });

    // Delete the folder itself
    await Folder.deleteOne({ _id: folder._id });

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Server error while deleting folder" });
  }
};

// Helper function to check if a folder is a descendant of another
const checkIfDescendant = async (folderId, parentId) => {
  if (folderId.toString() === parentId.toString()) {
    return true;
  }

  const parent = await Folder.findById(parentId);

  if (!parent || !parent.parent) {
    return false;
  }

  return checkIfDescendant(folderId, parent.parent);
};

// Helper function to get all descendant folders
const getDescendantFolders = async (folderId) => {
  const descendants = [];

  // Find direct children
  const children = await Folder.find({ parent: folderId });

  for (const child of children) {
    descendants.push(child._id);

    // Recursively get descendants
    const childDescendants = await getDescendantFolders(child._id);
    descendants.push(...childDescendants);
  }

  return descendants;
};
