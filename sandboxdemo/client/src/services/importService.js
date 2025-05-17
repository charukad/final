import api from "./api";

// Import from file
export const importFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/import/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error importing file:", error);
    throw error;
  }
};

// Import from clipboard
export const importFromClipboard = async (text, format, title) => {
  try {
    const response = await api.post("/import/clipboard", {
      text,
      format,
      title,
    });

    return response.data;
  } catch (error) {
    console.error("Error importing from clipboard:", error);
    throw error;
  }
};
