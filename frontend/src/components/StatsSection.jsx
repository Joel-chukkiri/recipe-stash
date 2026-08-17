import React from 'react';
import { BookOpen, Sparkles, Heart, ChefHat } from 'lucide-react';

export const StatsSection = ({ stats = {} }) => {
  const {
    total_recipes = 0,
    this_month = 0,
    favorite_recipes = 0,
    unique_ingredients_count = 0,
  } = stats;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFE8E5', color: '#F2555F' }}>
          <BookOpen size={24} />
        </div>
        <div>
          <div className="stat-number">{total_recipes}</div>
          <div className="stat-label">Saved Recipes</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
          <Sparkles size={24} />
        </div>
        <div>
          <div className="stat-number">{this_month}</div>
          <div className="stat-label">Saved This Month</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
          <Heart size={24} />
        </div>
        <div>
          <div className="stat-number">{favorite_recipes}</div>
          <div className="stat-label">Favorite Dishes</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
          <ChefHat size={24} />
        </div>
        <div>
          <div className="stat-number">{unique_ingredients_count}</div>
          <div className="stat-label">Unique Ingredients</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
