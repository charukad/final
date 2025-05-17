import React, { useEffect, useRef, useState } from 'react';
import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Cloudinary Upload Widget component
 * Loads the Cloudinary Upload Widget script and provides an interface
 * @param {function} onSuccess - Callback when upload is successful
 * @param {function} onError - Callback when upload fails
 * @param {function} onClose - Callback when widget is closed
 * @param {string} uploadPreset - Optional preset name to use for uploads
 */
const CloudinaryUploadWidget = ({ 
  onSuccess, 
  onError, 
  onClose,
  uploadPreset: propUploadPreset
}) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const [customPreset, setCustomPreset] = useState(propUploadPreset || '');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeWidget = (preset = customPreset) => {
    if (!window.cloudinary) {
      console.error('Cloudinary not loaded');
      if (onError) onError(new Error('Cloudinary not loaded'));
      return;
    }
    
    // If widget already exists, destroy it first
    if (widgetRef.current && widgetRef.current.destroy) {
      widgetRef.current.destroy();
    }
    
    cloudinaryRef.current = window.cloudinary;
    
    // Use the preset from props, state, or default
    const effectivePreset = preset || propUploadPreset || 'uwz9y3ge';
    
    // Create the upload widget
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: effectivePreset,
        folder: cloudinaryConfig.folder,
        cropping: true,
        multiple: false,
        sources: ['local', 'url', 'camera'],
        logging: true,
        showAdvancedOptions: true,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#F4F5F5'
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('Upload Widget error:', error);
          if (onError) {
            // Provide a more helpful error message
            if (error.statusText && error.statusText.includes('preset')) {
              onError({
                ...error,
                message: 'Upload preset error: You need to create an unsigned upload preset in your Cloudinary account.',
                statusText: error.statusText
              });
            } else {
              onError(error);
            }
          }
          return;
        }
        
        console.log('Widget result:', result);
        
        if (result.event === 'success') {
          console.log('Upload success:', result.info);
          if (onSuccess) onSuccess(result.info);
        } else if (result.event === 'close') {
          if (onClose) onClose();
        }
      }
    );
    
    setIsInitialized(true);
  };
  
  useEffect(() => {
    // Add the Cloudinary widget script
    if (!document.getElementById('cloudinary-upload-widget-script')) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.id = 'cloudinary-upload-widget-script';
      script.async = true;
      
      script.onload = () => initializeWidget();
      script.onerror = () => {
        console.error('Failed to load Cloudinary widget script');
        if (onError) onError(new Error('Failed to load Cloudinary widget'));
      };
      
      document.body.appendChild(script);
    } else {
      // Script already loaded
      initializeWidget();
    }
    
    return () => {
      // Clean up if needed
      if (widgetRef.current && widgetRef.current.destroy) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
    };
  }, [propUploadPreset]);
  
  useEffect(() => {
    // If upload preset prop changes, reinitialize the widget
    if (isInitialized && propUploadPreset !== customPreset) {
      setCustomPreset(propUploadPreset || '');
      initializeWidget(propUploadPreset);
    }
  }, [propUploadPreset]);
  
  const handleCustomPresetChange = (e) => {
    setCustomPreset(e.target.value);
  };
  
  const handleCustomPresetApply = () => {
    initializeWidget(customPreset);
  };
  
  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error('Widget not initialized');
      if (onError) onError(new Error('Widget not initialized'));
    }
  };
  
  return (
    <div className="cloudinary-uploader-container">
      <div className="cloudinary-preset-config">
        <input
          type="text"
          value={customPreset}
          onChange={handleCustomPresetChange}
          placeholder="Enter your Cloudinary upload preset"
          className="cloudinary-preset-input"
        />
        <button 
          onClick={handleCustomPresetApply}
          className="cloudinary-preset-apply"
        >
          Apply Preset
        </button>
      </div>
      
      <button 
        onClick={openWidget}
        className="cloudinary-upload-button"
        disabled={!isInitialized}
      >
        Upload Image
      </button>
    </div>
  );
};

export default CloudinaryUploadWidget; 