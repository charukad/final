import api from "./api";

// Get all notes with optional filters
export const getNotes = async (filters = {}) => {
  const params = new URLSearchParams();

  // Add filters to query params
  if (filters.folder) params.append("folder", filters.folder);
  if (filters.favorite) params.append("favorite", "true");
  if (filters.tag) params.append("tag", filters.tag);
  if (filters.deleted) params.append("deleted", "true");
  if (filters.search) params.append("search", filters.search);

  const response = await api.get(`/notes?${params.toString()}`);
  return response.data;
};

// Get a single note by ID
export const getNoteById = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    // Check if the note contains media content
    const hasMedia = noteData.content && 
                    (noteData.content.includes('data:image/') || 
                     noteData.content.includes('data:video/'));
    
    if (hasMedia) {
      console.log("Creating note with embedded media content");
    }
    
    const response = await api.post("/notes", noteData);
    return response.data;
  } catch (error) {
    console.error("Error creating note:", error);
    // Retry once if there's a connection error or timeout
    if (error.message && (error.message.includes('network') || 
                         error.code === 'ECONNABORTED' || 
                         (error.response && error.response.status >= 500))) {
      console.log("Network/server error, retrying create...");
      const response = await api.post("/notes", noteData);
      return response.data;
    }
    throw error;
  }
};

// Update a note
export const updateNote = async (id, updateData) => {
  try {
    // Log information about the update
    const contentLength = updateData.content ? updateData.content.length : 0;
    const hasMedia = updateData.content && 
                    (updateData.content.includes('data:image/') || 
                     updateData.content.includes('data:video/'));
    
    console.log(`Updating note ${id} with data:`, {
      title: updateData.title,
      contentLength: contentLength,
      containsMedia: hasMedia
    });
    
    // If note contains a lot of media, log it for debugging
    if (hasMedia && contentLength > 500000) {
      console.log("Note contains large media content, update may take longer");
    }
    
    const response = await api.put(`/notes/${id}`, updateData);
    console.log("Note updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error);
    
    // Retry once if there's a connection error, timeout, or server error
    if (error.message && (error.message.includes('network') || 
                         error.code === 'ECONNABORTED' || 
                         (error.response && error.response.status >= 500))) {
      console.log("Network/server error, retrying update...");
      try {
        // Add delay before retry for server errors
        if (error.response && error.response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const response = await api.put(`/notes/${id}`, updateData);
        console.log("Note update retry successful");
        return response.data;
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

// Move a note to trash
export const trashNote = async (id) => {
  const response = await api.put(`/notes/${id}/trash`);
  return response.data;
};

// Restore a note from trash
export const restoreNote = async (id) => {
  const response = await api.put(`/notes/${id}/restore`);
  return response.data;
};

// Permanently delete a note
export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

// Upload image for a note
export const uploadNoteImage = async (noteId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(`/notes/${noteId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
