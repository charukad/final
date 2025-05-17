import api from "./api";

// Get all folders
export const getFolders = async () => {
  const response = await api.get("/folders");
  return response.data;
};

// Create a new folder
export const createFolder = async (folderData) => {
  const response = await api.post("/folders", folderData);
  return response.data;
};

// Update a folder
export const updateFolder = async (id, updateData) => {
  const response = await api.put(`/folders/${id}`, updateData);
  return response.data;
};

// Delete a folder
export const deleteFolder = async (id) => {
  const response = await api.delete(`/folders/${id}`);
  return response.data;
};
