import React, { useState } from 'react';
import { Heart, Edit3, Trash2, ArrowUpRight, Sparkles, ChefHat } from 'lucide-react';
import RecipeImage from './RecipeImage';
import { formatDomain, sanitizeUrl } from '../utils/urlHelper';

export const RecipeCard = ({
  recipe,
  onSelectRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  onStashRecipe,
  isStashed = false,
  previewMode = false,
  showStashButton = false,
  imageLoading = 'lazy',
}) => {
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  if (!recipe) return null;

  const title = recipe.title || recipe.strMeal || 'Untitled Recipe';
  const category = recipe.category || recipe.strCategory || 'Dinner';
  const area = recipe.area || recipe.strArea || '';
  const imageUrl = recipe.image_url || recipe.strMealThumb || '';
  const sourceUrl = recipe.source_url || recipe.strSource || recipe.strYoutube || '';
  const sourceType = recipe.source_type || (recipe.idMeal ? 'themealdb' : 'custom');
  const isFavorite = !!recipe.is_favorite;

  const domain = sourceType === 'themealdb' ? 'themealdb.com' : formatDomain(sourceUrl);

  // Ingredients parsing
  let ingredients = [];
  if (Array.isArray(recipe.parsed_ingredients)) {
    ingredients = recipe.parsed_ingredients;
  } else if (typeof recipe.ingredients_list === 'string') {
    ingredients = recipe.ingredients_list
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (previewMode) return;
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 400);
    if (onToggleFavorite) {
      onToggleFavorite(recipe);
    } else if (onStashRecipe) {
      onStashRecipe(recipe);
    }
  };

  const handleCardClick = () => {
    if (previewMode) return;
    if (onSelectRecipe) onSelectRecipe(recipe);
  };

  return (
    <article
      className={`editorial-card ${previewMode ? 'preview-mode' : ''}`}
      onClick={handleCardClick}
      role={previewMode ? 'region' : 'button'}
      tabIndex={previewMode ? -1 : 0}
      onKeyDown={(e) => !previewMode && e.key === 'Enter' && handleCardClick()}
      style={previewMode ? { cursor: 'default' } : undefined}
    >
      {/* Top Media Image */}
      <div className="card-top-media">
        <RecipeImage
          src={imageUrl}
          alt={title}
          title={title}
          category={category}
          loading={imageLoading}
        />

        {/* Category Badge */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {category && (
            <span className="card-top-category">
              {category}
            </span>
          )}
          {sourceType === 'themealdb' && (
            <span
              className="card-top-category"
              style={{ backgroundColor: 'var(--bg-peach)', color: 'var(--primary-coral)' }}
            >
              TheMealDB
            </span>
          )}
        </div>

        {/* Favorite / Stash Heart Button */}
        {!previewMode && (
          <button
            className={`card-favorite-action ${isFavorite || isStashed ? 'active' : ''} ${
              isHeartPopping ? 'animate-heart-pop' : ''
            }`}
            onClick={handleFavoriteClick}
            title={
              isFavorite
                ? 'Favorited'
                : isStashed
                ? 'In your Stash'
                : 'Save to Stash'
            }
            aria-label="Toggle favorite or save"
          >
            <Heart
              size={18}
              fill={isFavorite || isStashed ? 'var(--primary-coral)' : 'none'}
              color={isFavorite || isStashed ? 'var(--primary-coral)' : 'currentColor'}
            />
          </button>
        )}
      </div>

      {/* Details Body */}
      <div className="card-details-body">
        <h3 className="card-recipe-title font-serif" title={title}>
          {title.trim() || 'Recipe Title Appears Here'}
        </h3>

        {/* Ingredient preview tags */}
        <div className="card-ingredient-tags">
          {ingredients.length > 0 ? (
            ingredients.slice(0, 3).map((ing, idx) => (
              <span key={idx} className="ingredient-badge">
                {ing.length > 20 ? ing.substring(0, 18) + '…' : ing}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {previewMode ? 'Add ingredients one per line...' : 'Ingredients not listed'}
            </span>
          )}
          {ingredients.length > 3 && (
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-coral)' }}>
              +{ingredients.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Bar / Actions */}
      <div className="card-bottom-bar" onClick={(e) => e.stopPropagation()}>
        {sourceUrl ? (
          <a
            href={previewMode ? '#' : sanitizeUrl(sourceUrl)}
            target={previewMode ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="card-source-domain"
            title={`Source: ${domain}`}
            onClick={(e) => previewMode && e.preventDefault()}
          >
            <ArrowUpRight size={14} color="var(--primary-coral)" />
            <span>{domain}</span>
          </a>
        ) : (
          <span className="card-source-domain" style={{ color: 'var(--text-muted)' }}>
            <span>Private Stash</span>
          </span>
        )}

        {/* Action Controls */}
        {!previewMode && (
          <div className="card-quick-actions">
            {showStashButton ? (
              <button
                className={isStashed ? 'btn-stash-secondary' : 'btn-stash-peach'}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStashRecipe) onStashRecipe(recipe);
                }}
              >
                <Heart
                  size={13}
                  fill={isStashed ? 'var(--primary-coral)' : 'none'}
                  color="var(--primary-coral)"
                />
                <span>{isStashed ? '✓ In Stash' : '♡ Stash'}</span>
              </button>
            ) : (
              <>
                {onEditRecipe && (
                  <button
                    className="card-mini-btn"
                    onClick={() => onEditRecipe(recipe)}
                    title="Edit recipe"
                    aria-label="Edit recipe"
                  >
                    <Edit3 size={15} />
                  </button>
                )}
                {onDeleteRecipe && (
                  <button
                    className="card-mini-btn danger"
                    onClick={() => onDeleteRecipe(recipe)}
                    title="Delete from stash"
                    aria-label="Delete recipe"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default RecipeCard;
