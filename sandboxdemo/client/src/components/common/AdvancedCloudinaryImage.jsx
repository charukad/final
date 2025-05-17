import React from 'react';
import { AdvancedImage, placeholder, responsive } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill, scale, crop, thumbnail } from '@cloudinary/url-gen/actions/resize';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Advanced Cloudinary Image component using the new SDK
 * @param {string} publicId - The Cloudinary public ID of the image
 * @param {string} alt - Alt text for the image
 * @param {string} transformationType - Type of transformation ('fill', 'scale', 'crop', 'thumbnail')
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {boolean} autoFormat - Whether to automatically optimize format
 * @param {boolean} autoQuality - Whether to automatically optimize quality
 * @param {string} className - Additional CSS classes
 */
const AdvancedCloudinaryImage = ({
  publicId,
  alt = 'Image',
  transformationType = 'scale',
  width,
  height,
  autoFormat: useAutoFormat = true,
  autoQuality: useAutoQuality = true,
  className = ''
}) => {
  // Initialize Cloudinary instance
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudinaryConfig.cloudName
    }
  });

  if (!publicId) {
    return <div className="cloudinary-image-error">Missing image ID</div>;
  }

  // Create an image object using the SDK
  const myImage = cld.image(publicId);

  // Apply transformations based on props
  if (width || height) {
    switch (transformationType) {
      case 'fill':
        myImage.resize(fill().width(width).height(height));
        break;
      case 'crop':
        myImage.resize(crop().width(width).height(height));
        break;
      case 'thumbnail':
        myImage.resize(thumbnail().width(width).height(height));
        break;
      case 'scale':
      default:
        myImage.resize(scale().width(width).height(height));
        break;
    }
  }

  // Apply automatic format and quality if enabled
  if (useAutoFormat) {
    myImage.delivery(format(autoFormat()));
  }
  
  if (useAutoQuality) {
    myImage.delivery(quality(auto()));
  }

  return (
    <div className={`advanced-cloudinary-image-container ${className}`}>
      <AdvancedImage
        cldImg={myImage}
        alt={alt}
        plugins={[
          responsive({ steps: 100 }),
          placeholder({ mode: 'blur' })
        ]}
        onError={(e) => console.error('Error loading Cloudinary image:', e)}
      />
    </div>
  );
};

export default AdvancedCloudinaryImage; 