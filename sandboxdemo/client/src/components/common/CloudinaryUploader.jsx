import React, { useState } from 'react';
import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Component for uploading images to Cloudinary
 * @param {function} onSuccess - Callback function when upload succeeds, receives the Cloudinary response
 * @param {function} onError - Callback function when upload fails
 * @param {string} uploadPreset - Cloudinary upload preset (optional)
 * @param {string} buttonText - Text for the upload button
 * @param {string} className - Additional CSS classes for the container
 */
const CloudinaryUploader = ({
  onSuccess,
  onError,
  uploadPreset = cloudinaryConfig.uploadPreset,
  buttonText = 'Upload Image',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);
      
      console.log(`Uploading file to Cloudinary: ${file.name} (${Math.round(file.size/1024)} KB)`);
      console.log(`Using cloud name: ${cloudinaryConfig.cloudName}`);
      console.log(`Using upload preset: ${uploadPreset}`);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', cloudinaryConfig.folder);
      
      // Perform upload using fetch with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
          console.log(`Upload progress: ${percentage}%`);
        }
      });
      
      // Handle completion
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Upload successful. Response:', response);
              setUploading(false);
              onSuccess && onSuccess(response);
            } catch (parseError) {
              console.error('Error parsing Cloudinary response:', parseError);
              console.error('Raw response:', xhr.responseText);
              setUploading(false);
              onError && onError(new Error('Failed to parse response'));
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            console.error('Response text:', xhr.responseText);
            setUploading(false);
            onError && onError(new Error(`Upload failed with status: ${xhr.status}`));
          }
        }
      };
      
      // Open connection and send data
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, true);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setUploading(false);
      setProgress(0);
      onError && onError(error);
    }
  };

  return (
    <div className={`cloudinary-uploader ${className}`}>
      <input
        type="file"
        id="cloudinary-upload-input"
        accept="image/*"
        onChange={handleUpload}
        className="cloudinary-file-input"
        disabled={uploading}
        style={{ display: 'none' }}
      />
      
      <label 
        htmlFor="cloudinary-upload-input" 
        className={`cloudinary-upload-button ${uploading ? 'uploading' : ''}`}
        disabled={uploading}
      >
        {uploading ? `Uploading... ${progress}%` : buttonText}
      </label>
      
      {uploading && (
        <div className="cloudinary-upload-progress">
          <div 
            className="cloudinary-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader; 