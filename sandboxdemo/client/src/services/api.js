import axios from "axios";

const API_URL = "http://localhost:5001/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Increase timeout for larger content uploads
  timeout: 45000, // 45 seconds default
  // Enable automatic retries for GET requests
  retry: 3,
  retryDelay: 1000
});

// Function to get the authentication token
export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Add special handling for large content
    if (config.method === 'put' || config.method === 'post') {
      if (config.data) {
        // Check for large text content
        if (config.data.content && config.data.content.length > 50000) {
          console.log(`Large content detected (${config.data.content.length} chars), increasing timeout`);
          config.timeout = 60000; // 60 seconds for large content
        }
        
        // Check for base64 images in content
        if (config.data.content && 
            (config.data.content.includes('data:image/') || 
             config.data.content.includes('data:video/'))) {
          console.log("Media content detected, increasing timeout");
          config.timeout = 120000; // 2 minutes for content with embedded media
          
          // Add additional headers if needed for large content
          config.headers["X-Contains-Media"] = "true";
          
          // Log request size for debugging
          const requestSize = JSON.stringify(config.data).length;
          console.log(`Request size with media: ${(requestSize / 1024 / 1024).toFixed(2)} MB`);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get original request config
    const originalRequest = error.config;
    
    // Handle request timeout
    if (error.code === 'ECONNABORTED' && originalRequest && !originalRequest._retry) {
      console.log('Request timeout, retrying...');
      originalRequest._retry = true;
      
      // Check if it's a media upload and adjust timeout even more
      if (originalRequest.headers && originalRequest.headers["X-Contains-Media"]) {
        console.log("Media upload retry, increasing timeout further");
        originalRequest.timeout = 180000; // 3 minutes for retried media uploads
      }
      
      return api(originalRequest);
    }
    
    // Handle server errors for notes with retry logic 
    if (error.response && error.response.status >= 500 && 
        originalRequest && !originalRequest._retry &&
        (originalRequest.url.includes('/notes/') || originalRequest.url.includes('/notes'))) {
      console.log('Server error on note operation, retrying...');
      originalRequest._retry = true;
      
      // Add delay before retry
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 2000);
      });
    }
    
    // Handle unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;
