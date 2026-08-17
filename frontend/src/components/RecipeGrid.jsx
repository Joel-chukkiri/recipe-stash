import React from 'react';
import RecipeCard from './RecipeCard';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

export const RecipeGrid = ({
  recipes,
  isLoading,
  searchQuery,
  selectedCategory,
  onSelectRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  if (isLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (!recipes || recipes.length === 0) {
    const isFiltered = !!searchQuery || (selectedCategory && selectedCategory !== 'All');
    return (
      <EmptyState
        isFiltered={isFiltered}
        searchQuery={searchQuery}
        onOpenAddModal={onOpenAddModal}
      />
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onSelectRecipe={onSelectRecipe}
          onEditRecipe={onEditRecipe}
          onDeleteRecipe={onDeleteRecipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
