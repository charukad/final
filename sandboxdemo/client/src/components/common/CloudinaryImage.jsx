import React, { useState, useEffect } from 'react';
import { buildImageUrl, transformationOptions } from '../../config/cloudinary';

/**
 * Component for displaying images from Cloudinary
 * @param {string} publicId - The Cloudinary public ID of the image
 * @param {string} alt - Alt text for the image
 * @param {string} size - Size preset ('thumbnail', 'medium', 'full')
 * @param {object} options - Custom transformation options
 * @param {string} className - Additional CSS classes
 */
const CloudinaryImage = ({ 
  publicId, 
  alt = 'Image', 
  size = 'medium', 
  options = {}, 
  className = '' 
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!publicId) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Get preset options based on size
      const presetOptions = transformationOptions[size] || transformationOptions.medium;
      
      // Merge with custom options
      const mergedOptions = { ...presetOptions, ...options };
      
      // Build the optimized image URL
      const url = buildImageUrl(publicId, mergedOptions);
      setImageUrl(url);
      setLoading(false);
    } catch (err) {
      console.error('Error building Cloudinary URL:', err);
      setError(true);
      setLoading(false);
    }
  }, [publicId, size, options]);

  if (loading) {
    return <div className="cloudinary-image-loading">Loading image...</div>;
  }

  if (error || !imageUrl) {
    return <div className="cloudinary-image-error">Unable to load image</div>;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`cloudinary-image ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default CloudinaryImage; 