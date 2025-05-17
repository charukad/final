import api from './api';

/**
 * Upload an image to local server storage
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Response with image URL and details
 */
export const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Create form data for the file
    const formData = new FormData();
    formData.append('image', file);

    // Upload to server
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Get all uploaded images
 * @returns {Promise<Object>} - Response with array of images
 */
export const getImages = async () => {
  try {
    const response = await api.get('/files/images');
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

/**
 * Delete an image by filename
 * @param {string} filename - The filename to delete
 * @returns {Promise<Object>} - Response with success message
 */
export const deleteImage = async (filename) => {
  try {
    const response = await api.delete(`/files/images/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Convert base64 data to file object
 * @param {string} base64Data - Base64 image data
 * @param {string} filename - Optional filename
 * @returns {File} - File object created from base64 data
 */
export const base64ToFile = (base64Data, filename = 'image.jpg') => {
  // Extract the data part from base64 string if it includes the data URL prefix
  let base64Content = base64Data;
  let mimeType = 'image/jpeg'; // Default mime type
  
  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(',');
    if (parts.length === 2) {
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1];
        base64Content = parts[1];
        
        // Update filename extension based on mime type
        const ext = mimeType.split('/')[1];
        if (ext) {
          filename = `${filename.split('.')[0]}.${ext}`;
        }
      }
    }
  }
  
  // Convert base64 to binary
  const byteCharacters = atob(base64Content);
  const byteArrays = [];
  
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  // Create file from byte arrays
  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

/**
 * Upload a base64 image to the server
 * @param {string} base64Data - The base64 image data
 * @param {string} filename - Optional filename
 * @returns {Promise<Object>} - Promise resolving to upload response
 */
export const uploadBase64Image = async (base64Data, filename = 'image') => {
  if (!base64Data) {
    return Promise.reject(new Error('No image data provided'));
  }
  
  try {
    // Convert to file object
    const file = base64ToFile(base64Data, filename);
    if (!file) {
      return Promise.reject(new Error('Failed to convert base64 to file'));
    }
    
    // Upload file
    return await uploadImage(file);
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
}; 