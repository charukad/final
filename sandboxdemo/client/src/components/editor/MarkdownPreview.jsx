import React, { useEffect, useState } from 'react';
import { processEditorContent, extractImageContent } from './renderer';
import '../../styles/MarkdownPreview.css';

/**
 * Component for rendering markdown content with support for images and videos
 */
const MarkdownPreview = ({ content, className = '', imagesOnly = false }) => {
  const [processedContent, setProcessedContent] = useState('');
  
  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      return;
    }
    
    // Use the appropriate processor based on mode
    if (imagesOnly) {
      // Extract only images to avoid duplicating text content
      const imageContent = extractImageContent(content);
      const processed = processEditorContent(imageContent);
      setProcessedContent(processed);
    } else {
      // Process the full content
      const processed = processEditorContent(content || '');
      setProcessedContent(processed);
    }
  }, [content, imagesOnly]);
  
  return (
    <div 
      className={`markdown-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MarkdownPreview; 