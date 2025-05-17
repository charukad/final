import React, { useEffect, useState } from 'react';

const StyleChecker = () => {
  const [styleStatus, setStyleStatus] = useState('checking');
  
  useEffect(() => {
    // Check if styles are applied by comparing computed and inline styles
    const testElement = document.createElement('div');
    testElement.style.display = 'none';
    testElement.className = 'style-test';
    document.body.appendChild(testElement);
    
    // Add a test class with known properties
    const styleElement = document.createElement('style');
    styleElement.innerHTML = '.style-test { color: red !important; }';
    document.head.appendChild(styleElement);
    
    // Check if styles are applied
    const computedStyle = window.getComputedStyle(testElement);
    const isStyleApplied = computedStyle.color === 'rgb(255, 0, 0)';
    
    // Clean up
    document.body.removeChild(testElement);
    document.head.removeChild(styleElement);
    
    setStyleStatus(isStyleApplied ? 'working' : 'broken');
  }, []);
  
  // Force specific inline styles that should override any external CSS
  const containerStyle = {
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  };
  
  const headingStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: styleStatus === 'working' ? '#4caf50' : 
           styleStatus === 'broken' ? '#f44336' : '#ff9800'
  };
  
  const buttonStyle = {
    padding: '6px 12px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  };
  
  const refreshStyles = () => {
    window.location.reload();
  };
  
  return (
    <div style={containerStyle}>
      <div style={headingStyle}>
        Style Status: {styleStatus === 'working' ? 'Working ✓' : 
                      styleStatus === 'broken' ? 'Broken ✗' : 'Checking...'}
      </div>
      {styleStatus !== 'working' && (
        <button 
          onClick={refreshStyles}
          style={buttonStyle}
        >
          Fix Styles
        </button>
      )}
    </div>
  );
};

export default StyleChecker; 