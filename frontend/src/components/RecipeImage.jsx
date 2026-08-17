import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { getRecipeImage } from '../utils/imageHelper';

export const RecipeImage = ({
  src,
  alt = 'Recipe dish',
  title = '',
  category = 'Dinner',
  className = '',
  loading = 'lazy',
}) => {
  const [imgSrc, setImgSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    if (src && typeof src === 'string' && src.trim() && src !== 'null' && src !== 'undefined') {
      setImgSrc(src.trim());
    } else {
      const fallback = getRecipeImage(title, category);
      setImgSrc(fallback);
    }
  }, [src, title, category]);

  const handleError = () => {
    const fallback = getRecipeImage(title, category);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`recipe-img-placeholder ${className}`} style={{ height: '100%', width: '100%' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Utensils size={20} color="var(--primary-coral)" />
        </div>
        <span className="recipe-img-placeholder-title">
          {title || 'Delicious Recipe'}
        </span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {category || 'Recipe Stash'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Subtle Shimmer background while downloading */}
      {!isLoaded && (
        <div
          className="skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 0,
          }}
        />
      )}

      <img
        src={imgSrc}
        alt={alt || title || 'Recipe dish'}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
    </div>
  );
};

export default RecipeImage;
