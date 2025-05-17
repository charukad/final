const Note = require("../models/Note");
const htmlPdf = require("html-pdf");
const markdownIt = require("markdown-it")();
const docx = require("docx");
const fs = require("fs");
const path = require("path");
const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docx;
const JSZip = require("jszip");
const htmlToText = require("html-to-text");

// Export a single note to various formats
exports.exportNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    // Validate format parameter
    const validFormats = ["pdf", "docx", "markdown", "html", "txt"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ message: "Invalid export format" });
    }

    // Find note and check ownership
    const note = await Note.findOne({
      _id: id,
      user: req.user.id,
    }).populate("tags", "name");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Export based on requested format
    switch (format) {
      case "pdf":
        return exportToPdf(note, res);
      case "docx":
        return exportToDocx(note, res);
      case "markdown":
        return exportToMarkdown(note, res);
      case "html":
        return exportToHtml(note, res);
      case "txt":
        return exportToText(note, res);
      default:
        return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Server error during export" });
  }
};

// Export multiple notes (bulk export)
exports.exportNotes = async (req, res) => {
  try {
    const { ids, format } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid note IDs provided" });
    }

    // Validate format parameter
    const validFormats = ["pdf", "docx", "markdown", "html", "txt", "zip"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ message: "Invalid export format" });
    }

    // Find notes and check ownership
    const notes = await Note.find({
      _id: { $in: ids },
      user: req.user.id,
    }).populate("tags", "name");

    if (notes.length === 0) {
      return res.status(404).json({ message: "No valid notes found" });
    }

    // If only one note, use single note export
    if (notes.length === 1) {
      const note = notes[0];

      switch (format) {
        case "pdf":
          return exportToPdf(note, res);
        case "docx":
          return exportToDocx(note, res);
        case "markdown":
          return exportToMarkdown(note, res);
        case "html":
          return exportToHtml(note, res);
        case "txt":
          return exportToText(note, res);
        default:
          break;
      }
    }

    // For multiple notes, create a zip file
    if (format === "zip") {
      return exportToZip(notes, req.body.subFormat || "html", res);
    }

    // For multiple notes in a single file format, combine them
    switch (format) {
      case "pdf":
        return exportMultipleToPdf(notes, res);
      case "docx":
        return exportMultipleToDocx(notes, res);
      case "markdown":
        return exportMultipleToMarkdown(notes, res);
      case "html":
        return exportMultipleToHtml(notes, res);
      case "txt":
        return exportMultipleToText(notes, res);
      default:
        return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Server error during export" });
  }
};

// Helper function to convert HTML to PDF
const exportToPdf = (note, res) => {
  const options = {
    format: "Letter",
    border: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
    header: {
      height: "0.5in",
      contents: `<div style="text-align: center; font-size: 10px;">NoteFlow - ${note.title}</div>`,
    },
    footer: {
      height: "0.5in",
      contents: {
        default:
          '<div style="text-align: center; font-size: 10px;">Page {{page}} of {{pages}}</div>',
      },
    },
  };

  // Prepare HTML content
  const tagsHtml =
    note.tags.length > 0
      ? `<div class="tags"><strong>Tags:</strong> ${note.tags
          .map((tag) => tag.name)
          .join(", ")}</div>`
      : "";

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const createdDate = new Date(note.createdAt).toLocaleDateString(
    "en-US",
    dateOptions
  );
  const updatedDate = new Date(note.updatedAt).toLocaleDateString(
    "en-US",
    dateOptions
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${note.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .metadata {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .tags {
          font-size: 12px;
          margin-bottom: 20px;
        }
        .content {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="title">${note.title}</div>
      <div class="metadata">
        <div>Created: ${createdDate}</div>
        <div>Last Updated: ${updatedDate}</div>
      </div>
      ${tagsHtml}
      <div class="content">
        ${note.content}
      </div>
    </body>
    </html>
  `;

  // Generate PDF
  htmlPdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      console.error("PDF generation error:", err);
      return res.status(500).json({ message: "Error generating PDF" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizeFilename(note.title)}.pdf"`
    );

    // Send buffer
    res.send(buffer);
  });
};

// Helper function to convert HTML to DOCX
const exportToDocx = async (note, res) => {
  // Convert HTML content to text and clean up
  const textContent = htmlToText.fromString(note.content, {
    wordwrap: 130,
    ignoreHref: true,
    ignoreImage: true,
  });

  // Create DOCX document
  const doc = new Document({
    title: note.title,
    creator: "NoteFlow",
    description: `Export of note "${note.title}"`,
    styles: {
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          run: {
            size: 36,
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: { after: 300 },
          },
        },
      ],
    },
  });

  // Add title
  doc.addSection({
    properties: {},
    children: [
      new Paragraph({
        text: note.title,
        heading: HeadingLevel.TITLE,
      }),

      // Add metadata
      new Paragraph({
        children: [
          new TextRun({
            text: `Created: ${new Date(note.createdAt).toLocaleDateString(
              "en-US"
            )}`,
            size: 20,
          }),
        ],
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Last Updated: ${new Date(note.updatedAt).toLocaleDateString(
              "en-US"
            )}`,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      }),

      // Add tags if present
      ...(note.tags.length > 0
        ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tags: ${note.tags.map((tag) => tag.name).join(", ")}`,
                  size: 20,
                  italics: true,
                }),
              ],
              spacing: { after: 400 },
            }),
          ]
        : []),

      // Add content
      ...textContent.split("\n").map(
        (line) =>
          new Paragraph({
            text: line,
          })
      ),
    ],
  });

  // Generate document buffer
  const buffer = await Packer.toBuffer(doc);

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFilename(note.title)}.docx"`
  );

  // Send buffer
  res.send(buffer);
};

// Helper function to convert HTML to Markdown
const exportToMarkdown = (note, res) => {
  // Convert HTML content to text
  const textContent = htmlToText.fromString(note.content, {
    wordwrap: 130,
    ignoreHref: false,
    ignoreImage: false,
  });

  // Create markdown content
  const markdown =
    `# ${note.title}\n\n` +
    `*Created: ${new Date(note.createdAt).toLocaleDateString("en-US")}*\n` +
    `*Last Updated: ${new Date(note.updatedAt).toLocaleDateString(
      "en-US"
    )}*\n\n` +
    (note.tags.length > 0
      ? `**Tags:** ${note.tags.map((tag) => tag.name).join(", ")}\n\n`
      : "") +
    `${textContent}\n`;

  // Set response headers
  res.setHeader("Content-Type", "text/markdown");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFilename(note.title)}.md"`
  );

  // Send markdown content
  res.send(markdown);
};

// Helper function to export as HTML
const exportToHtml = (note, res) => {
  // Prepare HTML content
  const tagsHtml =
    note.tags.length > 0
      ? `<div class="tags"><strong>Tags:</strong> ${note.tags
          .map((tag) => tag.name)
          .join(", ")}</div>`
      : "";

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const createdDate = new Date(note.createdAt).toLocaleDateString(
    "en-US",
    dateOptions
  );
  const updatedDate = new Date(note.updatedAt).toLocaleDateString(
    "en-US",
    dateOptions
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${note.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .metadata {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .tags {
          font-size: 12px;
          margin-bottom: 20px;
        }
        .content {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="title">${note.title}</div>
      <div class="metadata">
        <div>Created: ${createdDate}</div>
        <div>Last Updated: ${updatedDate}</div>
      </div>
      ${tagsHtml}
      <div class="content">
        ${note.content}
      </div>
    </body>
    </html>
  `;

  // Set response headers
  res.setHeader("Content-Type", "text/html");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFilename(note.title)}.html"`
  );

  // Send HTML content
  res.send(html);
};

// Helper function to export as plain text
const exportToText = (note, res) => {
  // Convert HTML content to text
  const textContent = htmlToText.fromString(note.content, {
    wordwrap: 80,
    ignoreHref: true,
    ignoreImage: true,
  });

  // Create plain text content
  const text =
    `${note.title}\n` +
    `${"=".repeat(note.title.length)}\n\n` +
    `Created: ${new Date(note.createdAt).toLocaleDateString("en-US")}\n` +
    `Last Updated: ${new Date(note.updatedAt).toLocaleDateString(
      "en-US"
    )}\n\n` +
    (note.tags.length > 0
      ? `Tags: ${note.tags.map((tag) => tag.name).join(", ")}\n\n`
      : "") +
    `${textContent}\n`;

  // Set response headers
  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFilename(note.title)}.txt"`
  );

  // Send text content
  res.send(text);
};

// Helper function to export multiple notes as a zip file
const exportToZip = async (notes, subFormat, res) => {
  const zip = new JSZip();

  // Process each note based on subFormat
  for (const note of notes) {
    let content = "";
    const sanitizedTitle = sanitizeFilename(note.title);

    switch (subFormat) {
      case "html":
        content = generateHtmlContent(note);
        zip.file(`${sanitizedTitle}.html`, content);
        break;
      case "markdown":
        content = generateMarkdownContent(note);
        zip.file(`${sanitizedTitle}.md`, content);
        break;
      case "txt":
        content = generateTextContent(note);
        zip.file(`${sanitizedTitle}.txt`, content);
        break;
      default:
        content = generateHtmlContent(note);
        zip.file(`${sanitizedTitle}.html`, content);
    }
  }

  // Generate zip file
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Set response headers
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="notes-export.zip"`
  );

  // Send zip file
  res.send(zipBuffer);
};

// Helper function to generate HTML content for a note
const generateHtmlContent = (note) => {
  const tagsHtml =
    note.tags.length > 0
      ? `<div class="tags"><strong>Tags:</strong> ${note.tags
          .map((tag) => tag.name)
          .join(", ")}</div>`
      : "";

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const createdDate = new Date(note.createdAt).toLocaleDateString(
    "en-US",
    dateOptions
  );
  const updatedDate = new Date(note.updatedAt).toLocaleDateString(
    "en-US",
    dateOptions
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${note.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .metadata {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .tags {
          font-size: 12px;
          margin-bottom: 20px;
        }
        .content {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="title">${note.title}</div>
      <div class="metadata">
        <div>Created: ${createdDate}</div>
        <div>Last Updated: ${updatedDate}</div>
      </div>
      ${tagsHtml}
      <div class="content">
        ${note.content}
      </div>
    </body>
    </html>
  `;
};

// Helper function to generate Markdown content for a note
const generateMarkdownContent = (note) => {
  // Convert HTML content to text
  const textContent = htmlToText.fromString(note.content, {
    wordwrap: 130,
    ignoreHref: false,
    ignoreImage: false,
  });

  return (
    `# ${note.title}\n\n` +
    `*Created: ${new Date(note.createdAt).toLocaleDateString("en-US")}*\n` +
    `*Last Updated: ${new Date(note.updatedAt).toLocaleDateString(
      "en-US"
    )}*\n\n` +
    (note.tags.length > 0
      ? `**Tags:** ${note.tags.map((tag) => tag.name).join(", ")}\n\n`
      : "") +
    `${textContent}\n`
  );
};

// Helper function to generate plain text content for a note
const generateTextContent = (note) => {
  // Convert HTML content to text
  const textContent = htmlToText.fromString(note.content, {
    wordwrap: 80,
    ignoreHref: true,
    ignoreImage: true,
  });

  return (
    `${note.title}\n` +
    `${"=".repeat(note.title.length)}\n\n` +
    `Created: ${new Date(note.createdAt).toLocaleDateString("en-US")}\n` +
    `Last Updated: ${new Date(note.updatedAt).toLocaleDateString(
      "en-US"
    )}\n\n` +
    (note.tags.length > 0
      ? `Tags: ${note.tags.map((tag) => tag.name).join(", ")}\n\n`
      : "") +
    `${textContent}\n`
  );
};

// Helper function to export multiple notes as a single PDF
const exportMultipleToPdf = (notes, res) => {
  // Generate HTML content for all notes
  let combinedContent = "";

  notes.forEach((note, index) => {
    const tagsHtml =
      note.tags.length > 0
        ? `<div class="tags"><strong>Tags:</strong> ${note.tags
            .map((tag) => tag.name)
            .join(", ")}</div>`
        : "";

    const dateOptions = { year: "numeric", month: "long", day: "numeric" };
    const createdDate = new Date(note.createdAt).toLocaleDateString(
      "en-US",
      dateOptions
    );
    const updatedDate = new Date(note.updatedAt).toLocaleDateString(
      "en-US",
      dateOptions
    );

    combinedContent += `
      <div class="note ${index > 0 ? "page-break" : ""}">
        <div class="title">${note.title}</div>
        <div class="metadata">
          <div>Created: ${createdDate}</div>
          <div>Last Updated: ${updatedDate}</div>
        </div>
        ${tagsHtml}
        <div class="content">
          ${note.content}
        </div>
      </div>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Notes Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .note {
          margin-bottom: 30px;
        }
        .page-break {
          page-break-before: always;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .metadata {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .tags {
          font-size: 12px;
          margin-bottom: 20px;
        }
        .content {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      ${combinedContent}
    </body>
    </html>
  `;

  // PDF options
  const options = {
    format: "Letter",
    border: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
    header: {
      height: "0.5in",
      contents: `<div style="text-align: center; font-size: 10px;">NoteFlow - Notes Export</div>`,
    },
    footer: {
      height: "0.5in",
      contents: {
        default:
          '<div style="text-align: center; font-size: 10px;">Page {{page}} of {{pages}}</div>',
      },
    },
  };

  // Generate PDF
  htmlPdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      console.error("PDF generation error:", err);
      return res.status(500).json({ message: "Error generating PDF" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="notes-export.pdf"`
    );

    // Send buffer
    res.send(buffer);
  });
};

// Additional helper functions for exporting multiple notes to other formats would go here
// (exportMultipleToDocx, exportMultipleToMarkdown, exportMultipleToHtml, exportMultipleToText)

// Helper function to sanitize filenames
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[\/\?<>\\:\*\|"]/g, "_") // Replace invalid chars with underscores
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 200); // Limit length
};
