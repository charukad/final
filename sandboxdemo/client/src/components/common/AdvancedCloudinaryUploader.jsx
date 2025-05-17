import React, { useState, useRef } from 'react';
import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Enhanced Cloudinary Uploader component with additional features
 * @param {function} onSuccess - Callback function when upload succeeds
 * @param {function} onError - Callback function when upload fails
 * @param {string} uploadPreset - Cloudinary upload preset (optional)
 * @param {string} buttonText - Text for the upload button
 * @param {boolean} allowMultiple - Whether to allow multiple file uploads
 * @param {string} accept - File types to accept (e.g., 'image/*')
 * @param {boolean} showPreview - Whether to show image preview before upload
 * @param {string} className - Additional CSS classes for the container
 */
const AdvancedCloudinaryUploader = ({
  onSuccess,
  onError,
  uploadPreset = cloudinaryConfig.uploadPreset,
  buttonText = 'Upload Image',
  allowMultiple = false,
  accept = 'image/*',
  showPreview = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Generate previews if enabled
    if (showPreview) {
      const newPreviews = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPreviewImages(newPreviews);
    }
  };

  const uploadFile = async (file) => {
    console.log(`Uploading file to Cloudinary: ${file.name} (${Math.round(file.size/1024)} KB)`);
    console.log(`Using cloud name: ${cloudinaryConfig.cloudName}`);
    console.log(`Using upload preset: ${uploadPreset}`);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', cloudinaryConfig.folder);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed with status: ${response.status}`, errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      return data;
    } catch (error) {
      console.error('Error during upload:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!previewImages.length && !fileInputRef.current.files.length) return;
    
    const filesToUpload = previewImages.length > 0 
      ? previewImages.map(preview => preview.file)
      : Array.from(fileInputRef.current.files);
      
    setUploading(true);
    setProgress(0);
    
    try {
      // For multiple files
      if (allowMultiple && filesToUpload.length > 1) {
        const results = [];
        let completed = 0;
        
        for (const file of filesToUpload) {
          const result = await uploadFile(file);
          results.push(result);
          completed++;
          setProgress(Math.round((completed / filesToUpload.length) * 100));
        }
        
        setUploading(false);
        setPreviewImages([]);
        onSuccess && onSuccess(results);
        fileInputRef.current.value = '';
      } 
      // For single file
      else {
        const result = await uploadFile(filesToUpload[0]);
        setUploading(false);
        setPreviewImages([]);
        onSuccess && onSuccess(result);
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploading(false);
      onError && onError(error);
    }
  };

  const clearPreviews = () => {
    // Clean up object URLs to prevent memory leaks
    previewImages.forEach(preview => URL.revokeObjectURL(preview.preview));
    setPreviewImages([]);
    fileInputRef.current.value = '';
  };

  return (
    <div className={`advanced-cloudinary-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={allowMultiple}
        onChange={handleFileSelect}
        className="cloudinary-file-input"
        disabled={uploading}
        style={{ display: showPreview ? 'none' : 'block' }}
      />
      
      {showPreview && (
        <div className="file-selection-area">
          <label 
            htmlFor="cloudinary-file-input" 
            className="file-select-button"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {buttonText}
          </label>
        </div>
      )}
      
      {/* Image previews */}
      {showPreview && previewImages.length > 0 && (
        <div className="preview-container">
          {previewImages.map((preview, index) => (
            <div key={index} className="preview-item">
              <img 
                src={preview.preview} 
                alt={`Preview ${index + 1}`} 
                className="preview-image" 
              />
            </div>
          ))}
          
          <div className="preview-actions">
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="upload-button"
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload'}
            </button>
            <button 
              onClick={clearPreviews}
              disabled={uploading}
              className="clear-button"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {!showPreview && (
        <button
          onClick={handleUpload}
          disabled={uploading || !fileInputRef.current?.files?.length}
          className="upload-button"
        >
          {uploading ? `Uploading... ${progress}%` : 'Upload'}
        </button>
      )}
      
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

export default AdvancedCloudinaryUploader; 