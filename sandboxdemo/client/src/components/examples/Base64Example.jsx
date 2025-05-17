import React from 'react';
import ImageViewer from '../common/ImageViewer';
import '../../styles/Base64Example.css';

/**
 * Example component showing how to use the ImageViewer with raw base64 data
 */
const Base64Example = () => {
  // The raw base64 string from the user's query
  const rawBase64Data = "/9j/4AAQSkZJRgABAQAAkACQAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAACQAAAAAQAAAJAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAB5SgAwAEAAAAAQAACVgAAAAA";

  return (
    <div className="base64-example">
      <h2>Base64 Image Display Example</h2>
      
      <div className="example-container">
        <h3>Your Image Properly Displayed:</h3>
        <ImageViewer 
          src={`data:image/jpeg;base64,${rawBase64Data}`} 
          alt="User's image" 
        />
      </div>
      
      <div className="example-usage">
        <h3>How to Display Raw Base64 String:</h3>
        <p>To properly display a base64 image, you need to add the correct prefix:</p>
        <pre className="code-example">{`
// For your specific image:
const rawBase64 = "${rawBase64Data}";

// Option 1: Pass with the data URL prefix
<ImageViewer 
  src={\`data:image/jpeg;base64,\${rawBase64}\`} 
  alt="My image" 
/>

// Option 2: Pass raw base64 string (component will add the prefix)
<ImageViewer 
  src={\`${rawBase64Data}\`} 
  alt="My image" 
/>
        `}</pre>
      </div>
      
      <div className="example-container">
        <h3>Raw Base64 String (What was showing before):</h3>
        <div className="base64-text">
          {rawBase64Data}
        </div>
      </div>
    </div>
  );
};

export default Base64Example; 