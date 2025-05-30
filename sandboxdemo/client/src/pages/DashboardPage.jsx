import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavigation from "../components/dashboard/TopNavigation";
import NoteDisplay from "../components/dashboard/NoteDisplay";
import "../styles/Dashboard.css";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'recent', 'favorites', etc.

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle view change (grid/list)
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  return (
    <div className={`dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Top Navigation */}
        <TopNavigation
          user={currentUser}
          onSearch={handleSearch}
          view={view}
          onViewChange={handleViewChange}
        />

        {/* Notes Display */}
        <NoteDisplay
          view={view}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
