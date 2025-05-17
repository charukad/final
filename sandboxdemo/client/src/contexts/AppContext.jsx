import React, { createContext, useContext, useState } from 'react';
import socketService from '../services/socketService';

// Create app context
const AppContext = createContext(null);

// Custom hook to use app context
export const useApp = () => useContext(AppContext);

// App provider component
export const AppProvider = ({ children }) => {
  const [socketEnabled, setSocketEnabled] = useState(false);
  
  // Enable socket functionality
  const enableSocket = () => {
    if (!socketEnabled) {
      console.log('Enabling socket functionality');
      socketService.enableSocket();
      setSocketEnabled(true);
    }
  };
  
  // Disable socket functionality
  const disableSocket = () => {
    if (socketEnabled) {
      console.log('Disabling socket functionality');
      socketService.disableSocket();
      setSocketEnabled(false);
    }
  };
  
  // Context value
  const value = {
    socketEnabled,
    enableSocket,
    disableSocket,
    socketService
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 