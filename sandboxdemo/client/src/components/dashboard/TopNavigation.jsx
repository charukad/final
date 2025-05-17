import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SearchBar from "../search/SearchBar";
import StyleChecker from "../common/StyleChecker";
import MathResearchAgent from "../math/MathResearchAgent";
import "../../styles/MathResearchAgent.css";

const TopNavigation = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Toggle user menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Add inline styles
  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    zIndex: 10
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    cursor: 'pointer'
  };
  
  const userAvatarStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#2196f3',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '40px',
    right: '20px',
    width: '200px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 20
  };

  const dropdownMenuStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0'
  };

  const dropdownItemStyle = {
    padding: '0',
    borderBottom: '1px solid #eee'
  };

  const dropdownLinkStyle = {
    display: 'block',
    padding: '10px 15px',
    color: '#333',
    textDecoration: 'none'
  };

  return (
    <div className="top-navigation" style={navStyle}>
      {/* Search Bar */}
      <SearchBar />
      
      {/* Math Research Agent */}
      <MathResearchAgent />

      <StyleChecker />

      {/* User Menu */}
      <div className="user-menu-container">
        <button className="user-button" onClick={toggleUserMenu} style={userButtonStyle}>
          <div className="user-avatar" style={userAvatarStyle}>{user?.fullName?.charAt(0) || 'U'}</div>
          <span className="user-name">{user?.fullName || 'User'}</span>
        </button>

        {showUserMenu && (
          <div className="user-dropdown" style={dropdownStyle}>
            <ul className="dropdown-menu" style={dropdownMenuStyle}>
              <li className="dropdown-item" style={dropdownItemStyle}>
                <a href="/settings/profile" style={dropdownLinkStyle}>Profile Settings</a>
              </li>
              <li className="dropdown-item" style={dropdownItemStyle}>
                <a href="/settings" style={dropdownLinkStyle}>App Settings</a>
              </li>
              <li className="dropdown-divider" style={{...dropdownItemStyle, borderBottom: '2px solid #eee'}}></li>
              <li className="dropdown-item" style={dropdownItemStyle}>
                <a href="#" onClick={handleLogout} style={dropdownLinkStyle}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavigation;
