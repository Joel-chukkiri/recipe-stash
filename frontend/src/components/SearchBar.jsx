import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Baking',
  'Drink',
  'Snack',
];

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  showFavoritesOnly,
  onToggleFavorites,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '1.1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6B7478',
            pointerEvents: 'none',
          }}
        />
        <input
          id="recipe-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipes by title or ingredients (e.g. Salmon, Garlic, Pasta)..."
          style={{
            width: '100%',
            padding: '0.85rem 2.75rem 0.85rem 3rem',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #F1E6DF',
            borderRadius: '9999px',
            fontSize: '0.98rem',
            color: '#17252D',
            boxShadow: '0 2px 10px rgba(23, 37, 45, 0.04)',
            transition: 'all 0.2s ease',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6B7478',
              padding: '4px',
              display: 'flex',
              borderRadius: '50%',
            }}
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="controls-bar" style={{ margin: 0, paddingBottom: 0, border: 'none' }}>
        <div className="category-tabs" id="category-tabs-container">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-sort-group">
          <button
            className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.86rem' }}
            onClick={onToggleFavorites}
          >
            ★ Favorites Only
          </button>

          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort recipes"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="-title">Title (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
