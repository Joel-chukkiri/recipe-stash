import React from 'react';
import { Home, Compass, Bookmark, Sparkles, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav = ({
  activeSection,
  onScrollToSection,
  onOpenAddModal,
}) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Floating Action Button */}
      <button
        id="mobile-fab-stash"
        className="fab-stash-btn"
        onClick={onOpenAddModal}
        aria-label="Stash a recipe"
      >
        <Plus size={28} strokeWidth={2.8} />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar" aria-label="Mobile Bottom Navigation">
        <div className="mobile-nav-inner">
          <button
            className={`mobile-nav-item ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Home size={19} />
            <span>Discover</span>
          </button>

          <button
            className={`mobile-nav-item ${activeSection === 'craving' ? 'active' : ''}`}
            onClick={() => onScrollToSection('craving-section')}
          >
            <Compass size={19} />
            <span>Craving</span>
          </button>

          <button
            className={`mobile-nav-item ${activeSection === 'stash' ? 'active' : ''}`}
            onClick={() => onScrollToSection('stash-section')}
          >
            <Bookmark size={19} />
            <span>My Stash</span>
          </button>

          <button
            className={`mobile-nav-item ${activeSection === 'inspiration' ? 'active' : ''}`}
            onClick={() => onScrollToSection('inspiration-section')}
          >
            <Sparkles size={19} />
            <span>Inspire</span>
          </button>

          <button
            className="mobile-nav-item"
            onClick={logout}
            title="Log Out"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
