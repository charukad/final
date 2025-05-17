/**
 * Helper functions for rendering content in the editor
 */

/**
 * Parses markdown image syntax and converts to proper HTML
 * @param {string} content - The content containing markdown image syntax
 * @returns {string} - The content with parsed images
 */
export const parseMarkdownImages = (content) => {
  if (!content) return '';
  
  // Match markdown image syntax ![alt](src)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  // More comprehensive regex for base64 image data that might not be properly formatted
  // Will match both complete data:image patterns and raw base64 strings that look like image data
  const rawBase64Regex = /(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/g;
  
  // First replace properly formatted markdown images
  let processed = content.replace(imageRegex, (match, alt, src) => {
    // Skip the "uploading" placeholder
    if (src === 'uploading') {
      return ''; // Return empty string to hide the placeholder
    }
    
    // Check if the source is a base64 string or Cloudinary URL
    if (src.startsWith('data:image')) {
      return `<img src="${src}" alt="${alt || ''}" class="editor-image" />`;
    } else if (src.includes('cloudinary.com')) {
      // Ensure proper rendering of Cloudinary images
      return `<img src="${src}" alt="${alt || ''}" class="editor-image cloudinary-img" />`;
    } else if (src.includes('/uploads/images/')) {
      // Handle local server-stored images
      return `<img src="${src}" alt="${alt || ''}" class="editor-image local-img" />`;
    }
    
    // For regular URLs
    return `<img src="${src}" alt="${alt || ''}" class="editor-image" />`;
  });
  
  // Then look for any raw base64 strings that might be showing as text
  processed = processed.replace(rawBase64Regex, (match) => {
    if (!match.includes('![')) { // Only replace if not already part of markdown syntax
      return `<img src="${match}" alt="Image" class="editor-image" />`;
    }
    return match;
  });
  
  return processed;
};

/**
 * Special function to extract ONLY the image content from markdown
 * This is used for the image preview to avoid duplicating text content
 * @param {string} content - The full markdown content
 * @returns {string} - Only the image markdown content
 */
export const extractImageContent = (content) => {
  if (!content) return '';
  
  // Extract only the image markdown syntax
  const imageRegex = /!\[.*?\]\(.*?\)/g;
  const matches = content.match(imageRegex) || [];
  
  // Join with paragraphs between them
  return matches.map(match => `<p>${match}</p>`).join('\n');
};

/**
 * Parses markdown video syntax and converts to proper HTML
 * @param {string} content - The content containing markdown video links
 * @returns {string} - The content with parsed videos
 */
export const parseMarkdownVideos = (content) => {
  if (!content) return '';
  
  // Match video markdown format [Video: title](src)
  const videoRegex = /\[Video: (.*?)\]\((.*?)\)/g;
  
  // Replace with actual HTML video tags
  return content.replace(videoRegex, (match, title, src) => {
    // Check if the source is a base64 string
    if (src.startsWith('data:video')) {
      return `<video src="${src}" title="${title || ''}" controls class="editor-video">Your browser does not support the video tag.</video>`;
    } else if (src.includes('cloudinary.com')) {
      // For Cloudinary videos, add appropriate classes and controls
      return `<video src="${src}" title="${title || ''}" controls class="editor-video cloudinary-video">Your browser does not support the video tag.</video>`;
    }
    
    // For regular URLs
    return `<video src="${src}" title="${title || ''}" controls class="editor-video">Your browser does not support the video tag.</video>`;
  });
};

/**
 * Check if a string appears to be a base64 image
 * @param {string} str - The string to check
 * @returns {boolean} - Whether it appears to be base64 image data
 */
export const isBase64Image = (str) => {
  // Base64 image data should start with data:image/ or be a valid base64 string
  return str && typeof str === 'string' && (
    str.startsWith('data:image/') || 
    /^[A-Za-z0-9+/=]{100,}$/.test(str)
  );
};

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && 
    url.includes('cloudinary.com') && 
    (url.includes('/image/upload/') || url.includes('/video/upload/'));
};

/**
 * Format a base64 string to ensure it has the proper image prefix
 * @param {string} base64String - The base64 string
 * @returns {string} - Properly formatted base64 image data
 */
export const formatBase64Image = (base64String) => {
  if (!base64String) return '';
  
  if (base64String.startsWith('data:image/')) {
    return base64String;
  }
  
  // If it looks like raw base64 data, add JPEG prefix (most common)
  if (/^[A-Za-z0-9+/=]{20,}$/.test(base64String)) {
    return `data:image/jpeg;base64,${base64String}`;
  }
  
  return base64String;
};

/**
 * Process all media content in the editor
 * @param {string} content - The raw editor content
 * @returns {string} - Processed content with HTML elements for media
 */
export const processEditorContent = (content) => {
  if (!content) return '';
  
  // Process images first
  let processed = parseMarkdownImages(content);
  
  // Then process videos
  processed = parseMarkdownVideos(processed);
  
  return processed;
}; 