import React, { useState, useRef } from 'react';
import { uploadImage } from '../../services/fileService';
import '../../styles/CloudinaryComponents.css'; // Reuse existing styles

/**
 * Local image uploader component
 * @param {function} onSuccess - Callback when upload is successful
 * @param {function} onError - Callback when upload fails
 * @param {function} onClose - Callback when uploader is closed
 */
const LocalImageUploader = ({ onSuccess, onError, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      onError(new Error('Please select an image file'));
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile) {
      onError(new Error('Please select an image file'));
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload the file
      const result = await uploadImage(selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Call success callback
      if (onSuccess) {
        onSuccess({
          secure_url: result.imageUrl,
          original_filename: result.originalName,
          public_id: result.fileName,
          format: selectedFile.type.split('/')[1],
          bytes: selectedFile.size
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (onError) onError(error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setPreview('');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedFile(null);
    setPreview('');
    if (onClose) onClose();
  };

  return (
    <div className="cloudinary-uploader-container">
      <div className="file-upload-area">
        {!selectedFile ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
              style={{ display: 'none' }}
            />
            <button 
              className="cloudinary-upload-button"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              Select Image
            </button>
            <p className="upload-instruction">
              Select an image from your computer to upload
            </p>
          </>
        ) : (
          <div className="file-preview-container">
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="image-preview" 
              />
            ) : (
              <div className="loading-preview">Loading preview...</div>
            )}
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
            <div className="action-buttons">
              <button 
                className="cloudinary-upload-button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? `Uploading... ${progress}%` : 'Upload'}
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
            {isUploading && (
              <div className="cloudinary-upload-progress">
                <div 
                  className="cloudinary-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalImageUploader; 