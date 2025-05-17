import React from 'react';

/**
 * Component for displaying base64 images properly
 * @param {string} base64Data - The base64 image data string
 * @param {string} altText - Alt text for the image
 * @param {string} className - Optional CSS class name for styling
 */
const Base64ImageDisplay = ({ base64Data, altText = 'Image', className = '' }) => {
  // If the base64 data doesn't include the data:image prefix, it's invalid
  if (!base64Data || typeof base64Data !== 'string') {
    return <div className="image-error">Invalid image data</div>;
  }

  // Ensure the data has the proper prefix if it's a raw base64 string
  let imageSource = base64Data;
  if (!base64Data.startsWith('data:image/')) {
    // If it looks like a standalone base64 string, add the prefix
    if (/^[A-Za-z0-9+/=]+$/.test(base64Data.substring(0, 20))) {
      imageSource = `data:image/jpeg;base64,${base64Data}`;
    }
  }

  return (
    <img 
      src={imageSource} 
      alt={altText} 
      className={`base64-image ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '';
        e.target.alt = 'Failed to load image';
        e.target.className = `${e.target.className} image-error`;
      }}
    />
  );
};

export default Base64ImageDisplay; 