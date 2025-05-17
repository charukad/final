import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../services/folderService";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../services/tagService";

// Create context
const OrganizationContext = createContext();

// Custom hook to use the organization context
export const useOrganization = () => useContext(OrganizationContext);

// Organization Provider Component
export const OrganizationProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch folders and tags on mount
  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true);
      try {
        // Fetch folders and tags in parallel
        const [foldersResponse, tagsResponse] = await Promise.all([
          getFolders(),
          getTags(),
        ]);

        setFolders(foldersResponse);
        setTags(tagsResponse);
        setError(null);
      } catch (error) {
        console.error("Error fetching organization data:", error);
        setError("Failed to load folders and tags. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, []);

  // Folder operations
  const handleCreateFolder = async (folderData) => {
    try {
      const newFolder = await createFolder(folderData);
      setFolders((prevFolders) => [...prevFolders, newFolder]);
      return newFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  };

  const handleUpdateFolder = async (id, updateData) => {
    try {
      const updatedFolder = await updateFolder(id, updateData);
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder._id === id ? updatedFolder : folder
        )
      );
      return updatedFolder;
    } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteFolder(id);
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder._id !== id)
      );
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  };

  // Tag operations
  const handleCreateTag = async (tagData) => {
    try {
      const newTag = await createTag(tagData);
      setTags((prevTags) => [...prevTags, newTag]);
      return newTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  };

  const handleUpdateTag = async (id, updateData) => {
    try {
      const updatedTag = await updateTag(id, updateData);
      setTags((prevTags) =>
        prevTags.map((tag) => (tag._id === id ? updatedTag : tag))
      );
      return updatedTag;
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await deleteTag(id);
      setTags((prevTags) => prevTags.filter((tag) => tag._id !== id));
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  };

  // Get folder structure
  const getFolderStructure = () => {
    // Helper function to build folder tree
    const buildFolderTree = (parentId = null) => {
      return folders
        .filter(
          (folder) =>
            (parentId === null && !folder.parent) ||
            (folder.parent && folder.parent.toString() === parentId)
        )
        .map((folder) => ({
          ...folder,
          children: buildFolderTree(folder._id),
        }));
    };

    return buildFolderTree();
  };

  // Get folder by id
  const getFolderById = (id) => {
    return folders.find((folder) => folder._id === id);
  };

  // Get tag by id
  const getTagById = (id) => {
    return tags.find((tag) => tag._id === id);
  };

  // Context value
  const value = {
    folders,
    tags,
    loading,
    error,
    getFolderStructure,
    getFolderById,
    getTagById,
    createFolder: handleCreateFolder,
    updateFolder: handleUpdateFolder,
    deleteFolder: handleDeleteFolder,
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
