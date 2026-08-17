import React from 'react';
import { Plus, SearchX, Sparkles, ChefHat } from 'lucide-react';

export const EmptyState = ({ isFiltered, searchQuery, onOpenAddModal }) => {
  if (isFiltered) {
    return (
      <div className="empty-state-box" style={{ borderRadius: '32px', backgroundColor: 'var(--bg-white)', border: '1.5px dashed var(--border-warm)' }}>
        <div className="empty-illustration" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
          <SearchX size={38} />
        </div>
        <h3 className="empty-title font-serif">
          {searchQuery ? `No recipes match "${searchQuery}"` : 'No recipes found in this category'}
        </h3>
        <p className="empty-desc">
          Try searching with different ingredients, clearing active filters, or stash a new recipe for this dish!
        </p>
        <button className="btn-stash-secondary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Stash New Recipe</span>
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state-box" style={{ borderRadius: '32px', backgroundColor: 'var(--bg-white)', border: '2px dashed var(--border-warm)', padding: '4rem 2rem' }}>
      <div className="empty-illustration" style={{ width: '96px', height: '96px', fontSize: '3rem', backgroundColor: 'var(--bg-peach)' }}>
        🍳
      </div>
      <h3 className="empty-title font-serif" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
        YOUR STASH IS EMPTY
      </h3>
      <p className="empty-desc" style={{ fontSize: '1.02rem', maxWidth: '420px' }}>
        That won't last long. Save recipes from TikTok, Instagram, food blogs, or your favorite chef and build your dream cookbook.
      </p>
      <button
        id="stash-first-recipe-empty-btn"
        className="btn-stash-primary"
        onClick={onOpenAddModal}
        style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
      >
        <Plus size={18} strokeWidth={2.8} />
        <span>+ Stash Your First Recipe</span>
      </button>
    </div>
  );
};

export default EmptyState;
