import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_ITEMS = [
  {
    name: 'Breakfast & Brunch',
    query: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Quick Dinners',
    query: 'Dinner',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Italian & Pasta',
    query: 'Pasta',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Asian & Bowls',
    query: 'Asian',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Indian & Spice',
    query: 'Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sweet Desserts',
    query: 'Dessert',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Artisan Baking',
    query: 'Baking',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Fresh & Healthy',
    query: 'Healthy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Craft Drinks',
    query: 'Drink',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
  },
];

export const CategoryExplorer = ({ selectedCategory, onSelectCategory, onScrollToStash }) => {
  return (
    <section id="craving-section" style={{ margin: '2.5rem 0 3.5rem 0' }} aria-label="Category Explorer">
      <div className="section-header-editorial">
        <div>
          <h2 className="section-title-editorial font-serif">
            What are you craving?
          </h2>
          <p className="section-subtitle-editorial">
            Browse through curated culinary styles or find dishes by mood.
          </p>
        </div>
      </div>

      <div className="category-scroll-container">
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.query.toLowerCase();
          return (
            <div
              key={cat.name}
              className={`category-card-item ${isSelected ? 'active' : ''}`}
              onClick={() => {
                onSelectCategory(cat.query);
                if (onScrollToStash) onScrollToStash();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="category-card-img-wrap">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <div className="category-card-content">
                <span className="category-card-name">{cat.name}</span>
                <ArrowRight size={15} className="category-card-arrow" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryExplorer;
