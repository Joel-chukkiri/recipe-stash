import React from 'react';
import { Plus, BookmarkPlus, Sparkles } from 'lucide-react';

export const PromoStashBanner = ({ onOpenAddModal }) => {
  return (
    <section className="promo-stash-banner" aria-label="Save Recipe Callout">
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
          <Sparkles size={15} />
          <span>Never Lose Another Great Recipe</span>
        </div>
        <h3 className="promo-banner-title font-serif">
          Found something delicious on Instagram or TikTok?
        </h3>
        <p className="promo-banner-desc">
          Drop the link, paste the ingredients, and stash it in your permanent digital cookbook before you lose it in your browser tabs.
        </p>
      </div>

      <button
        id="promo-stash-it-btn"
        className="btn-stash-primary"
        onClick={onOpenAddModal}
        style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
      >
        <Plus size={20} strokeWidth={2.8} />
        <span>+ STASH A RECIPE</span>
      </button>
    </section>
  );
};

export default PromoStashBanner;
