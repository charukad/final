import React, { useState, useEffect } from 'react';
import { isBase64Image, formatBase64Image, isCloudinaryUrl } from '../editor/renderer';
import CloudinaryImage from './CloudinaryImage';
import '../../styles/Base64ImageDisplay.css';
import '../../styles/CloudinaryComponents.css';

/**
 * Component for displaying images from different sources (URL, base64, Cloudinary)
 * @param {string} src - Image source (URL or base64 data)
 * @param {string} alt - Alternative text for the image
 * @param {string} className - Additional CSS classes
 */
const ImageViewer = ({ src, alt = 'Image', className = '' }) => {
  const [imageSource, setImageSource] = useState('');
  const [error, setError] = useState(false);
  const [isCloudinary, setIsCloudinary] = useState(false);
  const [cloudinaryId, setCloudinaryId] = useState('');

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // Handle different types of image sources
    try {
      // Check if it's a Cloudinary URL
      if (isCloudinaryUrl && isCloudinaryUrl(src)) {
        setIsCloudinary(true);
        
        // Extract the public ID from the Cloudinary URL
        const matches = src.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (matches && matches[1]) {
          setCloudinaryId(matches[1]);
        } else {
          setImageSource(src); // Fallback to regular URL handling
        }
        
        setError(false);
        return;
      }
      
      // Handle regular sources
      if (src.startsWith('data:image/')) {
        // Already a proper data URL
        setImageSource(src);
      } else if (src.startsWith('http') || src.startsWith('/')) {
        // Regular URL (external or local)
        setImageSource(src);
      } else if (isBase64Image(src)) {
        // Raw base64 data that needs formatting
        setImageSource(formatBase64Image(src));
      } else {
        // Unknown format, try as URL
        setImageSource(src);
      }
      
      setIsCloudinary(false);
      setError(false);
    } catch (err) {
      console.error('Error processing image source:', err);
      setError(true);
    }
  }, [src]);

  if (error || (!imageSource && !isCloudinary)) {
    return <div className="image-error">Unable to display image</div>;
  }

  // For Cloudinary images, use the specialized component
  if (isCloudinary && cloudinaryId) {
    return (
      <CloudinaryImage
        publicId={cloudinaryId}
        alt={alt}
        className={className}
        size="medium"
      />
    );
  }

  // For regular and base64 images
  return (
    <img
      src={imageSource}
      alt={alt}
      className={`base64-image ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default ImageViewer; 