/**
 * Utility functions for handling images
 */
import { cloudinaryConfig } from '../config/cloudinary';

/**
 * Convert base64 image data to a File object for upload
 * @param {string} base64Data - The base64 data string
 * @param {string} filename - The filename to use
 * @returns {File} - File object created from base64 data
 */
export const base64ToFile = (base64Data, filename = 'image.jpg') => {
  if (!base64Data) return null;
  
  try {
    // Remove the data URL prefix if present
    const base64Content = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Determine file type
    let contentType = 'image/jpeg'; // Default
    if (base64Data.includes('data:image/')) {
      contentType = base64Data.split(';')[0].split(':')[1];
    }
    
    // Decode base64 string
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create Blob and then File
    const blob = new Blob([bytes], { type: contentType });
    
    // Ensure filename has the correct extension
    const extension = contentType.split('/')[1] || 'jpg';
    const filenameWithExt = filename.includes(`.${extension}`) 
      ? filename 
      : `${filename}.${extension}`;
    
    return new File([blob], filenameWithExt, { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    return null;
  }
};

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Data - The base64 image data
 * @param {string} filename - Optional filename
 * @returns {Promise<object>} - Promise resolving to Cloudinary upload response
 */
export const uploadBase64ToCloudinary = async (base64Data, filename = 'image') => {
  if (!base64Data) {
    return Promise.reject(new Error('No image data provided'));
  }
  
  try {
    // Convert to file object
    const file = base64ToFile(base64Data, filename);
    if (!file) {
      return Promise.reject(new Error('Failed to convert base64 to file'));
    }
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'noteflow_uploads');
    formData.append('folder', cloudinaryConfig.folder);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract the base64 data from a data URL
 * @param {string} dataUrl - The complete data URL
 * @returns {string} - The base64 data part
 */
export const extractBase64Data = (dataUrl) => {
  if (!dataUrl) return '';
  
  if (dataUrl.includes('base64,')) {
    return dataUrl.split('base64,')[1];
  }
  
  return dataUrl;
};

/**
 * Check if a string is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  if (!url) return false;
  
  return url.includes('cloudinary.com') && 
    url.includes('/image/upload/');
};

/**
 * Replace base64 images in content with Cloudinary URLs
 * @param {string} content - The content containing base64 images
 * @param {function} progressCallback - Callback for upload progress
 * @returns {Promise<string>} - Content with Cloudinary URLs
 */
export const replaceBase64ImagesWithCloudinary = async (content, progressCallback) => {
  if (!content) return '';
  
  // Match markdown image syntax with base64 data
  const imageRegex = /!\[(.*?)\]\((data:image\/[^;]+;base64,[^)]+)\)/g;
  let matches = [];
  let match;
  
  // Collect all matches
  while ((match = imageRegex.exec(content)) !== null) {
    matches.push({
      alt: match[1],
      base64: match[2],
      fullMatch: match[0]
    });
  }
  
  // If no base64 images found, return original content
  if (matches.length === 0) {
    return content;
  }
  
  let processedContent = content;
  let completed = 0;
  
  // Process each match
  for (const item of matches) {
    try {
      // Upload base64 to Cloudinary
      const uploadResult = await uploadBase64ToCloudinary(
        item.base64, 
        `image_${Date.now()}`
      );
      
      // Replace in content
      const cloudinaryUrl = uploadResult.secure_url;
      const markdownImage = `![${item.alt}](${cloudinaryUrl})`;
      processedContent = processedContent.replace(item.fullMatch, markdownImage);
      
      // Update progress
      completed++;
      if (progressCallback) {
        progressCallback(completed / matches.length);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Skip this image but continue with others
    }
  }
  
  return processedContent;
}; 