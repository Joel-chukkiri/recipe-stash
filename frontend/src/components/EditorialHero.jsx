import React from 'react';
import { Search, Sparkles, Flame, Clock, ArrowRight } from 'lucide-react';

const QUICK_CHIPS = [
  'Quick & Easy',
  'Dinner',
  'Desserts',
  'Pasta',
  'Indian',
  'Healthy',
  'Breakfast',
];

export const EditorialHero = ({
  searchQuery,
  onSearchChange,
  onSelectChip,
  onScrollToStash,
}) => {
  return (
    <section className="hero-editorial-section" aria-label="Hero Showcase">
      {/* Left Content Area */}
      <div className="hero-left-content">
        <div className="hero-badge-pill">
          <Sparkles size={14} />
          <span>Curate Your Culinary World</span>
        </div>

        <h1 className="hero-headline">
          YOUR NEXT <em>FAVORITE MEAL</em> IS HERE.
        </h1>

        <p className="hero-subtext">
          Save recipes you discover everywhere — TikTok, Instagram, food blogs, or grandma's kitchen — and keep them all in one delicious personal stash.
        </p>

        {/* Large Central Search Input */}
        <div className="hero-search-box">
          <Search size={22} color="var(--primary-coral)" />
          <input
            id="hero-craving-search"
            type="text"
            className="hero-search-input"
            placeholder="What are you craving today? (e.g. Pasta, Salmon, Tacos)..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onScrollToStash();
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '0.2rem 0.5rem',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
            Popular Inspirations:
          </span>
          <div className="hero-quick-chips">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                className="hero-chip"
                onClick={() => onSelectChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Floating Composition */}
      <div className="hero-right-visual">
        <div className="hero-image-frame">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85"
            alt="Delicious culinary centerpiece"
          />
        </div>

        {/* Top Floating Badge */}
        <div className="floating-badge-top">
          <Flame size={18} color="var(--primary-coral)" />
          <span>Trending Recipes</span>
        </div>

        {/* Bottom Floating Recipe Card */}
        <div className="floating-card-bottom">
          <img
            src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=200&q=80"
            alt="Salmon thumbnail"
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              Tuscan Garlic Salmon
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={12} />
              <span>Ready in 20 mins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialHero;
