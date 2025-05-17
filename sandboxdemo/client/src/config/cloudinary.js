/**
 * Cloudinary configuration
 */

// Cloudinary credentials and settings
export const cloudinaryConfig = {
  cloudName: 'dn3crdv1k',
  apiKey: '578514861421813',
  apiSecret: 'sem8pP122yyOgwEsWkc3MLK0iaA', // Note: This should only be used on the server side
  uploadPreset: 'ml_default', // This isn't working for direct uploads
  folder: 'noteflow' // Custom folder to organize uploads
};

// Default transformation options for different types of images
export const transformationOptions = {
  thumbnail: {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto'
  },
  medium: {
    width: 500,
    height: 500,
    crop: 'limit',
    quality: 'auto'
  },
  full: {
    quality: 'auto',
    fetch_format: 'auto'
  }
};

// Create a function to generate a signature for signed uploads
// Note: This is a temporary workaround and NOT secure for production
// Normally signatures should be generated on the server side
export const generateSignature = () => {
  // In production, move this to server-side
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // For demonstration only - in a real app, you would generate this on the server
  // This implementation is incomplete and for illustration only
  console.warn('WARNING: Using client-side signature generation is not secure for production');
  return { timestamp };
};

// Build Cloudinary URL for an image
export const buildImageUrl = (publicId, options = {}) => {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  
  // Build transformation string
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  // Create final URL
  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/' 
    : '';
  
  return `${baseUrl}/${transformationString}${publicId}`;
};

// Extract public ID from a Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  try {
    // Match the public ID pattern in a Cloudinary URL
    const regex = /\/upload\/(?:v\d+\/)?(?:.*?\/)?([^.]+)/;
    const match = cloudinaryUrl.match(regex);
    
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}; 