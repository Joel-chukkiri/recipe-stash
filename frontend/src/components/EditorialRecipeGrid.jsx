import React from 'react';
import EditorialRecipeCard from './EditorialRecipeCard';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

const FILTER_TABS = [
  'All',
  'Favorites',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Baking',
  'Drink',
];

export const EditorialRecipeGrid = ({
  recipes,
  isLoading,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavorites,
  sortBy,
  onSortChange,
  onSelectRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  return (
    <section id="stash-section" style={{ margin: '3rem 0' }} aria-label="My Recipe Stash">
      {/* Section Title */}
      <div className="section-header-editorial">
        <div>
          <h2 className="section-title-editorial font-serif">
            From Your Stash
          </h2>
          <p className="section-subtitle-editorial">
            Recipes you've saved from across the web for tonight, tomorrow, and forever.
          </p>
        </div>

        {searchQuery && (
          <div style={{ padding: '0.4rem 0.9rem', backgroundColor: 'var(--bg-peach)', color: 'var(--primary-coral)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700 }}>
            Showing {recipes.length} result{recipes.length === 1 ? '' : 's'} for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Filter & Sort Controls */}
      <div className="stash-controls-bar">
        <div className="stash-filter-tabs">
          {FILTER_TABS.map((tab) => {
            let isActive = false;
            if (tab === 'Favorites') {
              isActive = showFavoritesOnly;
            } else if (tab === 'All') {
              isActive = !showFavoritesOnly && (!selectedCategory || selectedCategory === 'All');
            } else {
              isActive = !showFavoritesOnly && selectedCategory?.toLowerCase() === tab.toLowerCase();
            }

            return (
              <button
                key={tab}
                className={`stash-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (tab === 'Favorites') {
                    onToggleFavorites();
                  } else {
                    if (showFavoritesOnly) onToggleFavorites();
                    onSelectCategory(tab);
                  }
                }}
              >
                {tab === 'Favorites' ? '★ Favorites' : tab}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <select
            id="stash-sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-white)',
              border: '1.5px solid var(--border-warm)',
              fontWeight: 700,
              fontSize: '0.86rem',
              color: 'var(--text-dark)',
            }}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="-title">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : recipes.length === 0 ? (
        <EmptyState
          isFiltered={!!searchQuery || (selectedCategory && selectedCategory !== 'All') || showFavoritesOnly}
          searchQuery={searchQuery}
          onOpenAddModal={onOpenAddModal}
        />
      ) : (
        <div className="stash-recipe-grid">
          {recipes.map((recipe) => (
            <EditorialRecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelectRecipe={onSelectRecipe}
              onEditRecipe={onEditRecipe}
              onDeleteRecipe={onDeleteRecipe}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default EditorialRecipeGrid;
