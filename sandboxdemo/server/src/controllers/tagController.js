const Tag = require("../models/Tag");
const Note = require("../models/Note");

// Get all tags for the current user
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user.id }).sort({ name: 1 });

    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Server error while fetching tags" });
  }
};

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Validate tag name
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Check if tag with same name already exists
    const existingTag = await Tag.findOne({
      user: req.user.id,
      name: name.trim(),
    });

    if (existingTag) {
      return res
        .status(400)
        .json({ message: "A tag with this name already exists" });
    }

    // Create new tag
    const tag = new Tag({
      name: name.trim(),
      user: req.user.id,
      color: color || "#808080",
    });

    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Server error while creating tag" });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Find tag and check ownership
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        user: req.user.id,
        name: name.trim(),
        _id: { $ne: tag._id }, // Exclude current tag
      });

      if (existingTag) {
        return res
          .status(400)
          .json({ message: "A tag with this name already exists" });
      }

      tag.name = name.trim();
    }

    if (color) {
      tag.color = color;
    }

    await tag.save();

    res.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ message: "Server error while updating tag" });
  }
};

// Delete tag
exports.deleteTag = async (req, res) => {
  try {
    // Find tag and check ownership
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if tag is being used in notes
    const noteCount = await Note.countDocuments({
      tags: tag._id,
      user: req.user.id,
    });

    // Get all notes that use this tag
    const notesWithTag = await Note.find({
      tags: tag._id,
      user: req.user.id,
    });

    // Remove the tag from all notes
    for (const note of notesWithTag) {
      note.tags = note.tags.filter((t) => t.toString() !== tag._id.toString());
      await note.save();
    }

    // Delete the tag
    await Tag.deleteOne({ _id: tag._id });

    res.json({
      message: "Tag deleted successfully",
      notesUpdated: noteCount,
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ message: "Server error while deleting tag" });
  }
};
