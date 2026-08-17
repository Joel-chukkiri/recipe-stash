import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Plus, LogOut, Bookmark, ChevronDown, Compass, Sparkles } from 'lucide-react';

export const EditorialNavbar = ({ onOpenAddModal, totalRecipes = 0, onScrollToSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isDiscover = location.pathname === '/discover' || location.pathname.startsWith('/discover/');
  const isStash = location.pathname === '/stash' || location.pathname === '/dashboard';
  const isCreate = location.pathname === '/create-recipe' || location.pathname === '/recipes/create';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleCreateClick = () => {
    if (onOpenAddModal && typeof onOpenAddModal === 'function') {
      onOpenAddModal();
    } else {
      navigate('/create-recipe');
    }
  };

  return (
    <header className={`editorial-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        {/* Brand Logo */}
        <div
          className="brand-wrapper"
          onClick={() => {
            navigate('/discover');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
        >
          <div className="brand-emblem">
            <Utensils size={20} strokeWidth={2.4} />
          </div>
          <span className="brand-title">
            Recipe Stash<span className="brand-dot">.</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <button
            className={`nav-link-item ${isDiscover ? 'active' : ''}`}
            onClick={() => navigate('/discover')}
            style={{ color: isDiscover ? 'var(--primary-coral)' : undefined }}
          >
            Discover
          </button>
          <button
            className={`nav-link-item ${isStash ? 'active' : ''}`}
            onClick={() => navigate('/stash')}
            style={{ color: isStash ? 'var(--primary-coral)' : undefined }}
          >
            My Stash
          </button>
          <button
            className="nav-link-item"
            onClick={() => {
              if (location.pathname !== '/discover') {
                navigate('/discover');
                setTimeout(() => {
                  const el = document.getElementById('craving-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              } else if (onScrollToSection) {
                onScrollToSection('craving-section');
              }
            }}
          >
            Categories
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-right-actions">
          {/* Main Coral CTA Button */}
          <button
            id="header-stash-it-btn"
            className="btn-stash-primary"
            onClick={handleCreateClick}
            title="Create a custom recipe"
          >
            <Plus size={18} strokeWidth={2.8} />
            <span>+ Create Recipe</span>
          </button>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              id="user-profile-menu-btn"
              className="user-profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.8rem 0.35rem 0.4rem',
                backgroundColor: 'var(--bg-white)',
                border: '1.5px solid var(--border-warm)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-subtle)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-peach)',
                  color: 'var(--primary-coral)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getInitial(user?.username)}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'var(--text-dark)',
                  display: 'none',
                }}
                className="desktop-username"
              >
                {user?.username}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {dropdownOpen && (
              <div
                className="user-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 10px)',
                  width: '230px',
                  backgroundColor: 'var(--bg-white)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow-card-hover)',
                  padding: '0.6rem',
                  zIndex: 100,
                  animation: 'modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-warm)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                    {user?.username}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user?.email || 'Authenticated Chef'}
                  </div>
                </div>

                <button
                  className="user-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/stash');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bookmark size={15} color="var(--primary-coral)" />
                    My Stash
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: 'var(--primary-coral)',
                      backgroundColor: 'var(--bg-peach)',
                      padding: '0.1rem 0.55rem',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                    }}
                  >
                    {totalRecipes}
                  </span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border-warm)', margin: '0.4rem 0' }} />

                <button
                  className="user-dropdown-item danger"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.8rem',
                    color: 'var(--danger)',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
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
      <style>{`
        @media (min-width: 640px) {
          .desktop-username { display: inline !important; }
        }
        @media (max-width: 860px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default EditorialNavbar;
