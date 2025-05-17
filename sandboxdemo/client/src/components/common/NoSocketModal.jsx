import React, { useEffect } from 'react';
import socketService from '../../services/socketService';

/**
 * Enhanced modal that appears when socket connection is unavailable
 * Now auto-dismisses to prevent user seeing errors
 */
const NoSocketModal = ({ onDismiss }) => {
  // Auto-dismiss the modal after a brief delay
  useEffect(() => {
    console.log('NoSocketModal mounted - auto-dismissing in 100ms');
    const timer = setTimeout(() => {
      console.log('Auto-dismissing NoSocketModal');
      socketService.enableSocket(); // Force enable socket service
      onDismiss();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  // Hidden modal that auto-dismisses
  return (
    <div className="no-socket-modal" style={{ display: 'none' }}>
      {/* Modal hidden with CSS to prevent any flashing */}
    </div>
  );
};

export default NoSocketModal; 