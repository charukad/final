import React, { useState } from 'react';
import CloudinaryImage from '../common/CloudinaryImage';
import CloudinaryUploader from '../common/CloudinaryUploader';
import '../../styles/CloudinaryComponents.css';
import '../../styles/CloudinaryExample.css';

/**
 * Example component showing how to use Cloudinary for image handling
 */
const CloudinaryExample = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle successful image upload
  const handleUploadSuccess = (response) => {
    setUploadedImage(response);
    setIsUploading(false);
  };

  // Handle upload error
  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    setIsUploading(false);
    alert('Failed to upload image. Please try again.');
  };

  return (
    <div className="cloudinary-example">
      <h2>Cloudinary Image Management</h2>
      
      <div className="example-container">
        <h3>Upload an Image to Cloudinary</h3>
        <CloudinaryUploader 
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          buttonText={isUploading ? 'Uploading...' : 'Upload New Image'}
          className="example-uploader"
        />
      </div>
      
      {uploadedImage && (
        <div className="example-container">
          <h3>Your Uploaded Image</h3>
          <div className="uploaded-image-container">
            <CloudinaryImage 
              publicId={uploadedImage.public_id}
              alt="Uploaded image"
              size="medium"
            />
            <div className="image-details">
              <p><strong>Public ID:</strong> {uploadedImage.public_id}</p>
              <p><strong>Format:</strong> {uploadedImage.format}</p>
              <p><strong>Size:</strong> {Math.round(uploadedImage.bytes / 1024)} KB</p>
              <p><strong>URL:</strong> <a href={uploadedImage.secure_url} target="_blank" rel="noopener noreferrer">View full image</a></p>
            </div>
          </div>
        </div>
      )}
      
      <div className="example-container">
        <h3>How to Use Cloudinary in Your App</h3>
        <div className="code-example">
          <pre>{`
// Display a Cloudinary image
<CloudinaryImage 
  publicId="sample_image" 
  alt="Description" 
  size="medium" 
/>

// Use custom transformations
<CloudinaryImage 
  publicId="sample_image" 
  options={{ 
    width: 300,
    crop: 'fill',
    effect: 'grayscale'
  }} 
/>

// Upload new images
<CloudinaryUploader 
  onSuccess={(result) => console.log(result)}
  onError={(error) => console.error(error)}
/>
          `}</pre>
        </div>
      </div>
      
      <div className="example-container">
        <h3>Predefined Sample Images</h3>
        <div className="sample-images">
          <div className="sample-image">
            <h4>Thumbnail</h4>
            <CloudinaryImage 
              publicId="samples/landscapes/nature-mountains" 
              size="thumbnail"
              alt="Nature thumbnail" 
            />
          </div>
          <div className="sample-image">
            <h4>Medium</h4>
            <CloudinaryImage 
              publicId="samples/animals/cat" 
              size="medium"
              alt="Cat medium" 
            />
          </div>
          <div className="sample-image">
            <h4>Custom Options</h4>
            <CloudinaryImage 
              publicId="samples/food/spices" 
              options={{
                width: 300,
                height: 200,
                crop: 'fill',
                effect: 'sepia'
              }}
              alt="Food with effects" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryExample; 