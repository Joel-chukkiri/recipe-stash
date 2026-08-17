import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

const MOOD_COLLECTIONS = [
  {
    title: 'Comfort Food Classics',
    desc: 'Warm, rich, heartwarming recipes that taste like home.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    query: 'Dinner',
  },
  {
    title: 'Quick Weeknight Dinners',
    desc: 'Ready in 30 minutes or less with minimal kitchen cleanup.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    query: 'Dinner',
  },
  {
    title: 'Romantic Date Night',
    desc: 'Impressive restaurant-caliber dishes made effortlessly.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    query: 'Dinner',
  },
  {
    title: 'Lazy Sunday Brunch',
    desc: 'Artisanal sourdough toasts, fluffy waffles & golden eggs.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    query: 'Breakfast',
  },
  {
    title: 'Decadent Sweet Cravings',
    desc: 'Gooey brownies, warm cookies & velvety cheesecakes.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    query: 'Dessert',
  },
  {
    title: 'High-Protein Nourish Bowls',
    desc: 'Flavor-packed savory meals bursting with wholesome energy.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    query: 'Lunch',
  },
];

export const MoodCollections = ({ onSelectMood, onScrollToStash }) => {
  return (
    <section id="collections-section" style={{ margin: '4rem 0 3.5rem 0' }} aria-label="Explore by Mood">
      <div className="section-header-editorial">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            <Compass size={14} />
            <span>Curated Themes</span>
          </div>
          <h2 className="section-title-editorial font-serif">
            Explore by Mood
          </h2>
          <p className="section-subtitle-editorial">
            Whether you want a cozy rainy evening bowl or a fast 15-minute lunch.
          </p>
        </div>
      </div>

      <div className="collections-grid">
        {MOOD_COLLECTIONS.map((mood, idx) => (
          <div
            key={idx}
            className="mood-collection-card"
            onClick={() => {
              onSelectMood(mood.query);
              if (onScrollToStash) onScrollToStash();
            }}
            role="button"
            tabIndex={0}
          >
            <img src={mood.image} alt={mood.title} loading="lazy" />
            <div className="mood-card-overlay">
              <h3 className="mood-card-title">{mood.title}</h3>
              <p className="mood-card-desc">{mood.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoodCollections;
