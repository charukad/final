// In client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CloudinaryProvider } from "./contexts/CloudinaryContext";

// Import CSS reset first to ensure consistent base styling
import "./styles/CssReset.css";

// Import global and component styles
import "./index.css";
import "./styles/global.css";
import "./styles/Dashboard.css";
import "./styles/Editor.css";
import "./styles/SearchResults.css";
import "./styles/ExportImport.css";
import "./styles/AIAssistant.css";
import "./styles/MobileNavigation.css";
import "./styles/MobileSidebar.css";
import "./styles/FloatingActionButton.css";
import "./styles/Loading.css";
import "./styles/Modal.css";
import "./styles/CloudinaryComponents.css";
import "./styles/AdvancedCloudinaryComponents.css";
import "./styles/MathResearchAgent.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CloudinaryProvider>
    <App />
    </CloudinaryProvider>
  </React.StrictMode>
);
