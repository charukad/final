const Note = require("../models/Note");
const JSZip = require("jszip");
const htmlToText = require("html-to-text");
const markdownIt = require("markdown-it")();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "text/html",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/json",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only text, markdown, HTML, DOCX, JSON, and ZIP files are allowed."
        ),
        false
      );
    }
  },
}).single("file");

// Import a file and create notes
exports.importFile = (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const filePath = file.path;

      // Process file based on type
      let importResult;

      switch (file.mimetype) {
        case "text/plain":
          importResult = await importTextFile(filePath, req.user.id);
          break;
        case "text/markdown":
          importResult = await importMarkdownFile(filePath, req.user.id);
          break;
        case "text/html":
          importResult = await importHtmlFile(filePath, req.user.id);
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          importResult = await importDocxFile(filePath, req.user.id);
          break;
        case "application/zip":
          importResult = await importZipFile(filePath, req.user.id);
          break;
        case "application/json":
          importResult = await importJsonFile(filePath, req.user.id);
          break;
        default:
          throw new Error("Unsupported file type");
      }

      // Clean up the uploaded file
      fs.unlinkSync(filePath);

      res.status(200).json(importResult);
    } catch (error) {
      console.error("Import error:", error);

      // Clean up file if it exists
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }

      res.status(500).json({ message: `Import error: ${error.message}` });
    }
  });
};

// Import from clipboard text
exports.importFromClipboard = async (req, res) => {
  try {
    const { text, format, title } = req.body;

    if (!text) {
      return res.status(400).json({ message: "No content provided" });
    }

    let noteContent = "";
    let noteTitle = title || "Imported Note";

    // Process based on format
    switch (format) {
      case "plain":
        noteContent = `<p>${text.replace(/\n/g, "</p><p>")}</p>`;
        break;
      case "markdown":
        noteContent = markdownIt.render(text);
        break;
      case "html":
        noteContent = text;
        break;
      default:
        noteContent = `<p>${text.replace(/\n/g, "</p><p>")}</p>`;
    }

    // Create new note
    const note = new Note({
      title: noteTitle,
      content: noteContent,
      user: req.user.id,
    });

    await note.save();

    res.status(201).json({
      message: "Note created successfully",
      note: {
        _id: note._id,
        title: note.title,
      },
    });
  } catch (error) {
    console.error("Import from clipboard error:", error);
    res.status(500).json({ message: "Server error during import" });
  }
};

// Helper function to import text file
const importTextFile = async (filePath, userId) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Parse content - assume first line is title
  const lines = content.split("\n");
  const title = lines[0].trim() || "Imported Text Note";

  // Remove title and convert to HTML paragraphs
  const textContent = lines.slice(1).join("\n").trim();
  const htmlContent = `<p>${textContent
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")}</p>`;

  // Create new note
  const note = new Note({
    title,
    content: htmlContent,
    user: userId,
  });

  await note.save();

  return {
    message: "Text file imported successfully",
    note: {
      _id: note._id,
      title: note.title,
    },
  };
};

// Helper function to import markdown file
const importMarkdownFile = async (filePath, userId) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Parse content - assume first # heading is title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = (titleMatch && titleMatch[1]) || path.basename(filePath, ".md");

  // Convert markdown to HTML
  const htmlContent = markdownIt.render(content);

  // Create new note
  const note = new Note({
    title,
    content: htmlContent,
    user: userId,
  });

  await note.save();

  return {
    message: "Markdown file imported successfully",
    note: {
      _id: note._id,
      title: note.title,
    },
  };
};

// Helper function to import HTML file
const importHtmlFile = async (filePath, userId) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Try to extract title from HTML
  const titleMatch =
    content.match(/<title>(.+?)<\/title>/i) ||
    content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  const title =
    (titleMatch && titleMatch[1]) || path.basename(filePath, ".html");

  // Try to extract body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const htmlContent = bodyMatch ? bodyMatch[1] : content;

  // Create new note
  const note = new Note({
    title,
    content: htmlContent,
    user: userId,
  });

  await note.save();

  return {
    message: "HTML file imported successfully",
    note: {
      _id: note._id,
      title: note.title,
    },
  };
};

// Helper functions for importing DOCX, ZIP, and JSON files would go here
// These require additional libraries and more complex parsing logic

// For DOCX files, you would need a library like 'mammoth' to convert DOCX to HTML
// For ZIP files, you'd extract them and process each file according to its type
// For JSON files, you'd parse the JSON and create notes based on the structure
