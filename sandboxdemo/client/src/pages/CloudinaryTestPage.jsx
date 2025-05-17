import React, { useState } from 'react';
import CloudinaryUploadWidget from '../components/editor/CloudinaryUploadWidget';
import '../styles/CloudinaryTestPage.css';
import { cloudinaryConfig } from '../config/cloudinary';

const CloudinaryTestPage = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreset, setUploadPreset] = useState('');
  
  const handleUploadSuccess = (info) => {
    console.log('Upload success in test page:', info);
    setUploadedImages(prev => [...prev, info]);
    setUploadError(null);
  };
  
  const handleUploadError = (error) => {
    console.error('Upload error in test page:', error);
    setUploadError(error.message || (error.statusText || "Upload failed"));
  };
  
  const handleClose = () => {
    console.log('Widget closed');
  };
  
  const handlePresetChange = (e) => {
    setUploadPreset(e.target.value);
  };
  
  return (
    <div className="cloudinary-test-page">
      <h1>Cloudinary Upload Test</h1>
      
      <div className="setup-instructions">
        <h2>⚠️ Required Setup</h2>
        <p>Before using this test page, you need to create an <strong>unsigned upload preset</strong> in your Cloudinary account:</p>
        <ol>
          <li>Log in to your <a href="https://console.cloudinary.com" target="_blank" rel="noopener noreferrer">Cloudinary Console</a></li>
          <li>Go to Settings &gt; Upload &gt; Upload presets</li>
          <li>Check if you already have any upload presets. If you do, note their names.</li>
          <li>If you don't have a preset, click "Add upload preset"</li>
          <li>Set "Signing Mode" to <strong>Unsigned</strong></li>
          <li>Give it a name (e.g., "noteflow_uploads")</li>
          <li>Save the preset</li>
          <li>Enter the preset name in the field below</li>
        </ol>
      </div>
      
      <div className="preset-config-section">
        <h2>Enter Your Cloudinary Upload Preset</h2>
        <div className="preset-input-wrapper">
          <input
            type="text"
            value={uploadPreset}
            onChange={handlePresetChange}
            placeholder="e.g., noteflow_uploads"
            className="preset-input"
          />
          <p className="preset-help">
            Enter the name of an unsigned upload preset you've created in your Cloudinary account.
          </p>
        </div>
      </div>
      
      <div className="test-container">
        <h2>1. Upload an Image</h2>
        <p>Click the button below to test the Cloudinary upload widget:</p>
        
        <CloudinaryUploadWidget 
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onClose={handleClose}
          uploadPreset={uploadPreset}
        />
        
        {uploadError && (
          <div className="error-message">
            <p>Error: {uploadError}</p>
            {uploadError.includes("preset") && (
              <p className="error-hint">This error usually means you need to create an unsigned upload preset. See the instructions above.</p>
            )}
          </div>
        )}
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="results-container">
          <h2>2. Upload Results</h2>
          
          <div className="uploaded-images">
            {uploadedImages.map((image, index) => (
              <div key={index} className="uploaded-image-item">
                <img 
                  src={image.secure_url} 
                  alt={image.original_filename || `Uploaded ${index + 1}`} 
                />
                <div className="image-details">
                  <p><strong>URL:</strong> {image.secure_url}</p>
                  <p><strong>Public ID:</strong> {image.public_id}</p>
                  <p><strong>Format:</strong> {image.format}</p>
                  <p><strong>Size:</strong> {Math.round(image.bytes / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="api-info-container">
        <h2>3. API Information</h2>
        <pre>{`
// Cloudinary Configuration:
{
  cloudName: "${cloudinaryConfig.cloudName}",
  apiKey: "${cloudinaryConfig.apiKey}",
  folder: "${cloudinaryConfig.folder}"
}
        `}</pre>
        
        <div className="solution-code">
          <h3>Solution for Developers</h3>
          <p>Once you have a working preset, update this file:</p>
          <code>client/src/components/editor/CloudinaryUploadWidget.jsx</code>
          <p>with your working preset name:</p>
          <pre>{`const effectivePreset = preset || propUploadPreset || 'YOUR_PRESET_NAME_HERE';`}</pre>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTestPage; 