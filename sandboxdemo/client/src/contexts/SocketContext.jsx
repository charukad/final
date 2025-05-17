import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

// Create socket context
const SocketContext = createContext(null);

// Custom hook to use socket context
export const useSocket = () => useContext(SocketContext);

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const location = useLocation();
  
  // Check if current route should use socket
  const shouldUseSocket = () => {
    // Only initialize socket for authenticated routes that need it
    const socketRoutes = ['/dashboard', '/notes', '/search'];
    return socketRoutes.some(route => location.pathname.startsWith(route));
  };
  
  // Initialize socket when user is authenticated and on a socket-enabled route
  useEffect(() => {
    if (loading || connectionAttempted) return;
    
    // Only connect socket for authenticated users on specific routes
    if (currentUser && shouldUseSocket()) {
      console.log('Initializing socket connection for route:', location.pathname);
      try {
        socketService.initializeSocket();
      } catch (error) {
        console.error('Socket initialization failed:', error);
      }
    } else {
      // Disconnect if on a non-socket route or not authenticated
      console.log('Skipping socket connection for route:', location.pathname);
      socketService.disconnectSocket();
    }
    
    // Mark that we've attempted connection
    setConnectionAttempted(true);
    
    // Cleanup on unmount
    return () => {
      try {
        socketService.disconnectSocket();
      } catch (error) {
        console.error('Socket disconnect failed:', error);
      }
    };
  }, [currentUser, loading, connectionAttempted, location.pathname]);
  
  // Reset connection attempt state when route changes
  useEffect(() => {
    setConnectionAttempted(false);
  }, [location.pathname]);
  
  // Provide socket service
  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
}; 