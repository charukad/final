import api from "./api";

// Export a single note
export const exportNote = async (noteId, format) => {
  try {
    // This needs to use a direct URL for file download
    window.open(
      `${api.defaults.baseURL}/export/note/${noteId}?format=${format}`,
      "_blank"
    );
    return { success: true };
  } catch (error) {
    console.error("Error exporting note:", error);
    return { success: false, error };
  }
};

// Export multiple notes
export const exportNotes = async (noteIds, format, subFormat = null) => {
  try {
    // Create form data for the export request
    const data = {
      ids: noteIds,
      format,
    };

    if (subFormat) {
      data.subFormat = subFormat;
    }

    // Make a POST request to get a download link
    const response = await api.post("/export/notes", data, {
      responseType: "blob",
    });

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Set filename based on format
    let filename = "notes-export";
    switch (format) {
      case "pdf":
        filename += ".pdf";
        break;
      case "docx":
        filename += ".docx";
        break;
      case "markdown":
        filename += ".md";
        break;
      case "html":
        filename += ".html";
        break;
      case "txt":
        filename += ".txt";
        break;
      case "zip":
        filename += ".zip";
        break;
      default:
        filename += ".zip";
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error exporting notes:", error);
    return { success: false, error };
  }
};
