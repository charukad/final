import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// Public pages (no socket needed)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Protected pages (need socket)
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CloudinaryTestPage from './pages/CloudinaryTestPage';

// Test components
import GeminiTest from "./components/ai-assistant/GeminiTest";
import Base64Example from "./components/examples/Base64Example";
import CloudinaryExample from "./components/examples/CloudinaryExample";
import AdvancedCloudinaryExample from "./components/examples/AdvancedCloudinaryExample";

// Components and styles
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/Loading.css";

// Main App component with simplified routing
const App = () => {
  console.log("App rendering");
  
  // Add UI protection on component mount
  useEffect(() => {
    // Create a UI protection system that prevents editing of UI elements
    const protectUIElements = () => {
      // UI element selectors that should not be editable
      const protectedSelectors = [
        '.editor-toolbar', '.toolbar-button', '.toolbar-group', '.toolbar-divider',
        '.editor-header', '.editor-sidebar', '.panel-header', '.header-left', '.header-right',
        '.ai-toggle', '.collaboration-toggle', '.noteflow-gpt-toggle', '.editor-mode-toggle-btn',
        '.back-button', '.save-button', '.save-status', '.export-button', 
        '.dropdown-panel', '.sidebar-section', '.note-info', '.tags-list', 
        '.folder-select', '.share-button', '.note-title h2', '.mobile-editor-header',
        '.plain-editor-toolbar', '.plain-editor-button', '.plain-text-editor-container',
        '.mobile-menu-header', '.mobile-menu-items', '.mobile-menu',
        '.editor-container', '.editor-content', '.toolbar-select', '.toolbar-color-picker',
        '.upload-placeholder', '.special-chars-panel', '.special-char-button'
      ];

      // Apply protection to all matching elements
      protectedSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Make non-editable and non-selectable
          el.setAttribute('contenteditable', 'false');
          Object.assign(el.style, {
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            userModify: 'read-only',
            WebkitUserModify: 'read-only',
            MozUserModify: 'read-only',
            msUserModify: 'read-only',
            pointerEvents: 'auto'
          });
          
          // Add click event listener to stop propagation if needed
          el.addEventListener('input', e => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          });
        });
      });
    };

    // Create mutation observer to watch for DOM changes and protect new elements
    const observer = new MutationObserver(mutations => {
      // For each mutation, check if we need to protect new nodes
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Apply protection after a short delay to ensure React has finished rendering
          setTimeout(protectUIElements, 100);
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true,
      subtree: true
    });

    // Initial protection
    protectUIElements();

    // Run protection on a timer as well for extra safety
    const protectionInterval = setInterval(protectUIElements, 1000);

    // Cleanup on unmount
    return () => {
      observer.disconnect();
      clearInterval(protectionInterval);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes (no socket dependency) */}
          <Route key="landing" path="/" element={<LandingPage />} />
          <Route key="login" path="/login" element={<LoginPage />} />
          <Route key="register" path="/register" element={<RegisterPage />} />
          <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route key="reset-password" path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Test route for Gemini API */}
          <Route key="gemini-test" path="/gemini-test" element={<GeminiTest />} />
          
          {/* Test route for Base64 Image Example */}
          <Route key="image-example" path="/image-example" element={<Base64Example />} />
          
          {/* Test routes for Cloudinary Examples */}
          <Route key="cloudinary-example" path="/cloudinary" element={<CloudinaryExample />} />
          <Route key="advanced-cloudinary" path="/advanced-cloudinary" element={<AdvancedCloudinaryExample />} />
          
          {/* Protected routes (with socket) */}
          <Route key="dashboard" path="/dashboard" element={
            <ProtectedRoute>
              <OrganizationProvider>
                <DashboardPage />
              </OrganizationProvider>
            </ProtectedRoute>
          } />
          
          {/* Explicitly define /notes/new as its own route, separate from the parameter-based route */}
          <Route key="notes-new" path="/notes/new" element={
            <ProtectedRoute>
              <OrganizationProvider>
                <EditorPage key="new-note-editor" />
              </OrganizationProvider>
            </ProtectedRoute>
          } />
          
          {/* Other note routes with ID parameter */}
          <Route key="notes-edit" path="/notes/:id" element={
            <ProtectedRoute>
              <OrganizationProvider>
                <EditorPage key="existing-note-editor" />
              </OrganizationProvider>
            </ProtectedRoute>
          } />
          
          <Route key="search" path="/search" element={
            <ProtectedRoute>
              <OrganizationProvider>
                <SearchResultsPage />
              </OrganizationProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/cloudinary-test" element={
            <ProtectedRoute>
              <CloudinaryTestPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback route for any other path */}
          <Route key="fallback" path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
