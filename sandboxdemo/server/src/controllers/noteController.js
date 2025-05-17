const Note = require("../models/Note");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads/images");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
    }
  }
}).single('image');

// Get all notes for current user
exports.getNotes = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { folder, favorite, tag, deleted, search } = req.query;

    // Base query - notes belonging to current user and not deleted
    let query = {
      user: req.user.id,
      isDeleted: deleted === "true", // Only show deleted notes if specifically requested
    };

    // Add filters if provided
    if (folder) {
      query.folder = folder;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (tag) {
      query.tags = tag;
    }

    // Add search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Get notes with sorting (most recently updated first)
    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .populate("folder", "name")
      .populate("tags", "name color");

    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error while fetching notes" });
  }
};

// Get a specific note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate("folder", "name")
      .populate("tags", "name color");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Server error while fetching note" });
  }
};

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, folder, tags } = req.body;

    // Create new note with user ID
    const note = new Note({
      title: title || "Untitled Note",
      content: content || "",
      user: req.user.id,
      folder: folder || null,
      tags: tags || [],
    });

    // Save note
    await note.save();

    // Return the saved note with populated references
    const savedNote = await Note.findById(note._id)
      .populate("folder", "name")
      .populate("tags", "name color");

    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error while creating note" });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, folder, tags, isFavorite, images } = req.body;

    // Find note and check ownership
    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (folder !== undefined) note.folder = folder;
    if (tags !== undefined) note.tags = tags;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (images !== undefined) note.images = images;

    // Save updated note
    await note.save();

    // Return the updated note with populated references
    const updatedNote = await Note.findById(note._id)
      .populate("folder", "name")
      .populate("tags", "name color");

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server error while updating note" });
  }
};

// Upload image for a note
exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    try {
      const note = await Note.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!note) {
        // Delete uploaded file if note not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Note not found" });
      }

      // Add image to note's images array
      const imagePath = `/uploads/images/${req.file.filename}`;
      const position = note.images.length; // Add to end of images array
      
      note.images.push({
        path: imagePath,
        position: position
      });

      await note.save();

      res.json({
        message: "Image uploaded successfully",
        image: {
          path: imagePath,
          position: position
        }
      });
    } catch (error) {
      // Delete uploaded file if there's an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Server error while uploading image" });
    }
  });
};

// Soft delete a note (move to trash)
exports.trashNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isDeleted = true;
    note.deletedAt = new Date();

    await note.save();

    res.json({ message: "Note moved to trash" });
  } catch (error) {
    console.error("Error trashing note:", error);
    res.status(500).json({ message: "Server error while trashing note" });
  }
};

// Restore a note from trash
exports.restoreNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isDeleted = false;
    note.deletedAt = null;

    await note.save();

    res.json({ message: "Note restored from trash" });
  } catch (error) {
    console.error("Error restoring note:", error);
    res.status(500).json({ message: "Server error while restoring note" });
  }
};

// Permanently delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if note is already in trash
    if (!note.isDeleted) {
      return res.status(400).json({
        message: "Note must be in trash before permanent deletion",
      });
    }

    await Note.deleteOne({ _id: req.params.id });

    res.json({ message: "Note permanently deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error while deleting note" });
  }
};
