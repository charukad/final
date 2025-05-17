import api from "./api";

// Get all tags
export const getTags = async () => {
  const response = await api.get("/tags");
  return response.data;
};

// Create a new tag
export const createTag = async (tagData) => {
  const response = await api.post("/tags", tagData);
  return response.data;
};

// Update a tag
export const updateTag = async (id, updateData) => {
  const response = await api.put(`/tags/${id}`, updateData);
  return response.data;
};

// Delete a tag
export const deleteTag = async (id) => {
  const response = await api.delete(`/tags/${id}`);
  return response.data;
};
