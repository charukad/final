import React, { useState, useEffect, useCallback } from 'react';
import socketService from '../../services/socketService';

const SocketDebugger = ({ visible = false }) => {
  const [status, setStatus] = useState('Unknown');
  const [lastEvent, setLastEvent] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const updateStatus = useCallback(() => {
    const socket = socketService.getSocket();
    
    if (socketService.isEnabled() === false) {
      setStatus('Disabled');
    } else if (!socket) {
      setStatus('Not Initialized');
    } else if (socket.connected) {
      setStatus('Connected');
    } else if (socket.connecting) {
      setStatus('Connecting');
    } else {
      setStatus('Disconnected');
    }
  }, []);
  
  // Record socket events
  const recordEvent = useCallback((type, data) => {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      data: typeof data === 'object' ? JSON.stringify(data) : data
    };
    
    setLastEvent(event);
    setEventHistory(prev => [event, ...prev].slice(0, 20)); // Keep last 20 events
  }, []);
  
  // Set up event listeners
  useEffect(() => {
    if (!visible) return;
    
    updateStatus();
    
    const socket = socketService.getSocket();
    if (!socket) return;
    
    const handlers = {
      connect: () => {
        recordEvent('connect');
        updateStatus();
      },
      disconnect: (reason) => {
        recordEvent('disconnect', reason);
        updateStatus();
      },
      connect_error: (err) => {
        recordEvent('connect_error', err.message);
        updateStatus();
      },
      error: (err) => {
        recordEvent('error', err.message);
        updateStatus();
      }
    };
    
    // Attach listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    
    // Monitor emitted events by overriding the emit method
    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      recordEvent('emit', { event, args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg) });
      return originalEmit.apply(this, [event, ...args]);
    };
    
    // Cleanup
    return () => {
      if (socket) {
        Object.keys(handlers).forEach(event => {
          socket.off(event, handlers[event]);
        });
        
        // Restore original emit
        if (socket.emit !== originalEmit) {
          socket.emit = originalEmit;
        }
      }
    };
  }, [visible, updateStatus, recordEvent]);
  
  // Manual connection controls
  const reconnectSocket = () => {
    setStatus('Reconnecting...');
    socketService.reconnect()
      .then(success => {
        recordEvent('manual_reconnect', success ? 'success' : 'failed');
        updateStatus();
      });
  };
  
  const disconnectSocket = () => {
    recordEvent('manual_disconnect');
    socketService.disconnectSocket();
    updateStatus();
  };
  
  if (!visible) return null;
  
  return (
    <div className="socket-debugger">
      <h3>Socket Debugger</h3>
      
      <div className="status-panel">
        <div className="status-row">
          <span>Status:</span> 
          <span className={`status-indicator ${status.toLowerCase()}`}>{status}</span>
        </div>
        
        {lastEvent && (
          <div className="status-row">
            <span>Last Event:</span>
            <span>{lastEvent.type} - {lastEvent.timestamp.split('T')[1].split('.')[0]}</span>
          </div>
        )}
      </div>
      
      <div className="controls">
        <button 
          onClick={reconnectSocket}
          disabled={status === 'Connected' || status === 'Connecting'}>
          Reconnect
        </button>
        
        <button 
          onClick={disconnectSocket}
          disabled={status === 'Disconnected' || status === 'Not Initialized'}>
          Disconnect
        </button>
        
        <button onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      {showHistory && eventHistory.length > 0 && (
        <div className="event-history">
          <h4>Event History</h4>
          <ul>
            {eventHistory.map((event, index) => (
              <li key={index}>
                <span className="time">{event.timestamp.split('T')[1].split('.')[0]}</span>
                <span className={`event-type ${event.type}`}>{event.type}</span>
                <span className="event-data">{event.data}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <style jsx>{`
        .socket-debugger {
          background: #f3f3f3;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          font-family: monospace;
          font-size: 12px;
        }
        
        h3 {
          margin-top: 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .status-panel {
          margin-bottom: 10px;
        }
        
        .status-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .status-indicator {
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: bold;
        }
        
        .status-indicator.connected {
          background: #4caf50;
          color: white;
        }
        
        .status-indicator.disconnected, 
        .status-indicator.disabled {
          background: #f44336;
          color: white;
        }
        
        .status-indicator.connecting {
          background: #ff9800;
          color: white;
        }
        
        .status-indicator.not {
          background: #9e9e9e;
          color: white;
        }
        
        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        button {
          padding: 5px 10px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #9e9e9e;
          cursor: not-allowed;
        }
        
        .event-history {
          max-height: 200px;
          overflow-y: auto;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        
        .event-history h4 {
          margin-top: 0;
        }
        
        .event-history ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .event-history li {
          margin-bottom: 5px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .time {
          color: #777;
        }
        
        .event-type {
          padding: 1px 4px;
          border-radius: 3px;
        }
        
        .event-type.connect {
          background: #4caf50;
          color: white;
        }
        
        .event-type.disconnect,
        .event-type.connect_error,
        .event-type.error {
          background: #f44336;
          color: white;
        }
        
        .event-type.emit {
          background: #2196f3;
          color: white;
        }
        
        .event-data {
          word-break: break-all;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default SocketDebugger; 