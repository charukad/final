import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavigation from "../components/dashboard/TopNavigation";
import NoteDisplay from "../components/dashboard/NoteDisplay";
import MobileNavigation from "../components/common/MobileNavigation";
import MobileSidebar from "../components/common/MobileSidebar";
import FloatingActionButton from "../components/common/FloatingActionButton";
import "../styles/Dashboard.css";
import TouchGestures from "../components/common/TouchGestures";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [view, setView] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'recent', 'favorites', etc.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 'all', 'recent', 'favorites', etc.

  // Toggle sidebar collapsed state
  // Listen for window resize to determine if mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Open mobile sidebar
  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
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
      {/* Sidebar - Only shown on desktop */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Main Content */}
      <TouchGestures onSwipeRight={openMobileSidebar} enabled={isMobile}>
        <div className="dashboard-content">
          {/* Top Navigation - Only shown on desktop */}
          {!isMobile && (
            <TopNavigation
              user={currentUser}
              onSearch={handleSearch}
              view={view}
              onViewChange={handleViewChange}
            />
          )}

          {/* Mobile Navigation - Only shown on mobile */}
          {isMobile && <MobileNavigation onOpenSidebar={openMobileSidebar} />}

          {/* Notes Display */}
          <NoteDisplay
            view={view}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            isMobile={isMobile}
          />

          {/* Mobile Sidebar - Only shown when open */}
          {isMobile && (
            <MobileSidebar
              isOpen={mobileSidebarOpen}
              onClose={closeMobileSidebar}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Floating Action Button - Only shown on mobile */}
          {isMobile && <FloatingActionButton />}

          {/* Debug Links */}
          <div className="debug-links" style={{marginTop: '20px', padding: '10px', background: '#f7f7f7', borderRadius: '4px'}}>
            <h4>Debug Links</h4>
            <div><a href="/cloudinary-test" style={{color: '#3448C5'}}>Cloudinary Upload Test</a></div>
          </div>
        </div>
      </TouchGestures>
    </div>
  );
};

export default DashboardPage;
