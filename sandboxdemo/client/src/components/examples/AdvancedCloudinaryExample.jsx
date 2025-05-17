import React, { useState } from 'react';
import { CloudinaryProvider } from '../../contexts/CloudinaryContext';
import AdvancedCloudinaryImage from '../common/AdvancedCloudinaryImage';
import AdvancedCloudinaryUploader from '../common/AdvancedCloudinaryUploader';
import '../../styles/AdvancedCloudinaryComponents.css';
import '../../styles/CloudinaryExample.css';

// Import Cloudinary transformation components
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { byRadius } from '@cloudinary/url-gen/actions/roundCorners';
import { outline, shadow } from '@cloudinary/url-gen/actions/effect';
import { sepia, grayscale, blackwhite } from '@cloudinary/url-gen/actions/effect';
import { byAngle } from '@cloudinary/url-gen/actions/rotate';
import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Example component demonstrating advanced Cloudinary features
 */
const AdvancedCloudinaryExample = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageEffect, setImageEffect] = useState('none');
  
  // Initialize Cloudinary instance
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudinaryConfig.cloudName
    }
  });

  // Handle successful image upload
  const handleUploadSuccess = (response) => {
    setUploadedImage(response);
  };

  // Handle upload error
  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    alert('Failed to upload image. Please try again.');
  };

  // Apply different effects to the image
  const getTransformedImage = () => {
    if (!uploadedImage || !uploadedImage.public_id) return null;
    
    // Create a new image with the Cloudinary SDK
    const myImage = cld.image(uploadedImage.public_id);
    
    // Apply base transformations
    myImage
      .resize(scale().width(600))
      .roundCorners(byRadius(20));
      
    // Apply selected effect
    switch (imageEffect) {
      case 'sepia':
        myImage.effect(sepia());
        break;
      case 'grayscale':
        myImage.effect(grayscale());
        break;
      case 'blackwhite':
        myImage.effect(blackwhite());
        break;
      case 'shadow':
        myImage.effect(shadow().strength(50));
        break;
      case 'outline':
        myImage.effect(outline().width(5).color('orange'));
        break;
      case 'rotate':
        myImage.rotate(byAngle(45));
        break;
      default:
        // No effect
        break;
    }
    
    return myImage;
  };

  return (
    <CloudinaryProvider>
      <div className="cloudinary-example">
        <h2>Advanced Cloudinary Image Management</h2>
        
        <div className="example-container">
          <h3>Upload an Image</h3>
          <AdvancedCloudinaryUploader 
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            uploadPreset="ml_default"
            buttonText="Upload Image"
            showPreview={true}
            className="example-uploader"
          />
        </div>
        
        {uploadedImage && (
          <>
            <div className="example-container">
              <h3>Basic Display</h3>
              <AdvancedCloudinaryImage 
                publicId={uploadedImage.public_id}
                alt="Uploaded image"
                width={500}
                transformationType="scale"
              />
              <div className="image-details">
                <p><strong>Public ID:</strong> {uploadedImage.public_id}</p>
                <p><strong>Format:</strong> {uploadedImage.format}</p>
                <p><strong>Size:</strong> {Math.round(uploadedImage.bytes / 1024)} KB</p>
                <p><strong>Dimensions:</strong> {uploadedImage.width} x {uploadedImage.height}</p>
                <p><strong>URL:</strong> <a href={uploadedImage.secure_url} target="_blank" rel="noopener noreferrer">View full image</a></p>
              </div>
            </div>
            
            <div className="example-container">
              <h3>Image Transformations</h3>
              <div className="effects-control">
                <label htmlFor="effect-select">Apply Effect: </label>
                <select 
                  id="effect-select"
                  value={imageEffect}
                  onChange={(e) => setImageEffect(e.target.value)}
                  className="effect-selector"
                >
                  <option value="none">None</option>
                  <option value="sepia">Sepia</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="blackwhite">Black & White</option>
                  <option value="shadow">Shadow</option>
                  <option value="outline">Outline</option>
                  <option value="rotate">Rotate 45°</option>
                </select>
              </div>
              
              <div className="transformed-image-container">
                {getTransformedImage() && (
                  <AdvancedImage 
                    cldImg={getTransformedImage()} 
                    alt="Transformed image" 
                  />
                )}
              </div>
            </div>
            
            <div className="example-container">
              <h3>Responsive Images</h3>
              <div className="responsive-examples">
                <div className="responsive-example">
                  <h4>Original Size</h4>
                  <AdvancedCloudinaryImage 
                    publicId={uploadedImage.public_id}
                    transformationType="scale"
                    width={600}
                  />
                </div>
                <div className="responsive-example">
                  <h4>Thumbnail</h4>
                  <AdvancedCloudinaryImage 
                    publicId={uploadedImage.public_id}
                    transformationType="thumbnail"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="responsive-example">
                  <h4>Fill (1:1)</h4>
                  <AdvancedCloudinaryImage 
                    publicId={uploadedImage.public_id}
                    transformationType="fill"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="responsive-example">
                  <h4>Crop (16:9)</h4>
                  <AdvancedCloudinaryImage 
                    publicId={uploadedImage.public_id}
                    transformationType="crop"
                    width={400}
                    height={225}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="example-container">
          <h3>Using Cloudinary in Your React App</h3>
          <div className="code-example">
            <pre>{`
// Setup CloudinaryProvider in your app
import { CloudinaryProvider } from './contexts/CloudinaryContext';

function App() {
  return (
    <CloudinaryProvider>
      <YourComponents />
    </CloudinaryProvider>
  );
}

// Display an image with transformations
import AdvancedCloudinaryImage from './components/common/AdvancedCloudinaryImage';

<AdvancedCloudinaryImage 
  publicId="your_image_id" 
  transformationType="fill"
  width={400}
  height={300}
  alt="My Image"
/>

// Upload images
import AdvancedCloudinaryUploader from './components/common/AdvancedCloudinaryUploader';

<AdvancedCloudinaryUploader 
  onSuccess={(result) => console.log(result)}
  onError={(error) => console.error(error)}
  showPreview={true}
  allowMultiple={false}
/>
            `}</pre>
          </div>
        </div>
      </div>
    </CloudinaryProvider>
  );
};

export default AdvancedCloudinaryExample; 