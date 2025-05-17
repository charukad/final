import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const MobileNavigation = ({ onOpenSidebar }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
    closeMenu();
  };

  // Determine active route
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get current page title
  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/search") return "Search Results";
    if (location.pathname.startsWith("/notes/")) return "Note";
    if (location.pathname === "/settings") return "Settings";
    return "NoteFlow";
  };

  return (
    <div className="mobile-navigation">
      <div className="mobile-header">
        {location.pathname === "/dashboard" ? (
          <button className="sidebar-toggle" onClick={onOpenSidebar}>
            ≡
          </button>
        ) : (
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
        )}

        <h1 className="page-title">{getPageTitle()}</h1>

        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? "✕" : "⋮"}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="menu-header">
            <div className="user-info">
              <div className="user-avatar">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="user-details">
                <div className="user-name">{currentUser.fullName}</div>
                <div className="user-email">{currentUser.email}</div>
              </div>
            </div>
          </div>

          <nav className="menu-nav">
            <ul className="menu-list">
              <li className="menu-item">
                <Link
                  to="/dashboard"
                  className={`menu-link ${
                    isActive("/dashboard") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="menu-item">
                <Link to="/notes/new" className="menu-link" onClick={closeMenu}>
                  New Note
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  to="/settings"
                  className={`menu-link ${
                    isActive("/settings") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          <div className="menu-footer">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
