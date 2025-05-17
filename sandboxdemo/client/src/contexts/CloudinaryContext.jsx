import React, { createContext, useContext } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { cloudinaryConfig } from '../config/cloudinary';

// Create context
const CloudinaryContext = createContext();

/**
 * Provider component that makes Cloudinary instance available to any child component that calls useCloudinary()
 */
export const CloudinaryProvider = ({ children }) => {
  // Initialize Cloudinary instance with config
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudinaryConfig.cloudName
    },
    url: {
      secure: true // Use HTTPS
    }
  });

  return (
    <CloudinaryContext.Provider value={cld}>
      {children}
    </CloudinaryContext.Provider>
  );
};

/**
 * Custom hook that returns the Cloudinary instance
 */
export const useCloudinary = () => {
  const context = useContext(CloudinaryContext);
  if (!context) {
    throw new Error('useCloudinary must be used within a CloudinaryProvider');
  }
  return context;
};

export default CloudinaryContext; 