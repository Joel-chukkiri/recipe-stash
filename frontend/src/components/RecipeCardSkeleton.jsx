import React from 'react';

export const RecipeCardSkeleton = () => {
  return (
    <div
      className="editorial-card"
      style={{
        cursor: 'default',
        pointerEvents: 'none',
        border: '1px solid var(--border-warm)',
        minHeight: '380px',
      }}
      aria-hidden="true"
    >
      {/* Media Box Skeleton with Badge & Heart Shimmer */}
      <div className="skeleton-media-box">
        <div className="skeleton-badge skeleton" />
        <div className="skeleton-heart skeleton" />
      </div>

      {/* Details Skeleton */}
      <div className="card-details-body" style={{ gap: '0.85rem' }}>
        <div className="skeleton" style={{ height: '22px', width: '85%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '55%', borderRadius: '6px' }} />

        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
          <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '22px', width: '85px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '22px', width: '50px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Bottom Bar Skeleton */}
      <div
        className="card-bottom-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div className="skeleton" style={{ height: '16px', width: '100px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '28px', width: '75px', borderRadius: '14px' }} />
      </div>
    </div>
  );
};

export const RecipeSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="stash-recipe-grid" aria-label="Loading recipe cards">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default RecipeCardSkeleton;
