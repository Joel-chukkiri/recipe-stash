import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Plus, LogOut, Bookmark, User as UserIcon, ChevronDown, Sparkles } from 'lucide-react';

export const Navbar = ({ onOpenAddModal, totalRecipes = 0 }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo">
          <div className="brand-icon">
            <UtensilsCrossed size={20} strokeWidth={2.4} />
          </div>
          <span>Recipe Stash</span>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button
            id="add-recipe-btn"
            className="btn btn-primary desktop-only"
            onClick={onOpenAddModal}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Recipe</span>
          </button>

          {/* User Avatar & Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              id="user-profile-menu-btn"
              className="user-profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User profile menu"
            >
              <div className="avatar-circle">
                {getInitial(user?.username)}
              </div>
              <span className="desktop-only" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#17252D' }}>
                {user?.username || 'Account'}
              </span>
              <ChevronDown size={15} color="#6B7478" />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.username}</div>
                  <div className="user-dropdown-email">{user?.email || 'Authenticated Chef'}</div>
                </div>

                <div style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7478' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bookmark size={14} color="#F2555F" />
                    Saved Recipes
                  </span>
                  <span style={{ fontWeight: 700, color: '#17252D', backgroundColor: '#FFE8E5', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>
                    {totalRecipes}
                  </span>
                </div>

                <div style={{ height: '1px', backgroundColor: '#F1E6DF', margin: '0.35rem 0' }} />

                <button
                  id="logout-btn"
                  className="user-dropdown-item danger"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
