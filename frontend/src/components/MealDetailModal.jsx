import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Check, Copy, Sparkles, Video, Globe } from 'lucide-react';
import mealApi from '../services/mealApi';
import RecipeImage from './RecipeImage';

export const MealDetailModal = ({
  mealId,
  isOpen,
  onClose,
  isStashed = false,
  onStashMeal,
  onShowToast,
}) => {
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  // Fetch meal details when opened
  useEffect(() => {
    if (!isOpen || !mealId) {
      setMeal(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setCheckedIngredients({});

    mealApi
      .getMealById(mealId)
      .then((data) => {
        if (isMounted) {
          setMeal(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load meal details:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mealId]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ingredients = meal ? mealApi.parseMealIngredients(meal) : [];

  const toggleCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyIngredients = () => {
    if (!ingredients.length) return;
    const text = ingredients
      .map((item) => (item.measure ? `${item.measure} ${item.ingredient}` : item.ingredient))
      .join('\n');
    navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast('Ingredients copied to clipboard!', 'success');
    }
  };

  const handleStashClick = () => {
    if (!meal) return;
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 400);
    onStashMeal(meal);
  };

  const modalContent = (
    <div
      className="recipe-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div
        className="recipe-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '3px solid var(--bg-peach)',
                borderTopColor: 'var(--primary-coral)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem auto',
              }}
            />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              Fetching culinary details from TheMealDB...
            </p>
          </div>
        ) : meal ? (
          <>
            {/* Left Media Pane */}
            <div className="recipe-modal-image">
              <RecipeImage
                src={meal.strMealThumb}
                alt={meal.strMeal}
                title={meal.strMeal}
                category={meal.strCategory}
              />

              {/* Category & Cuisine Badges */}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', zIndex: 2 }}>
                {meal.strCategory && (
                  <span className="card-top-category">
                    {meal.strCategory}
                  </span>
                )}
                {meal.strArea && (
                  <span
                    className="card-top-category"
                    style={{ backgroundColor: 'var(--bg-dark-accent)', color: '#FFFFFF' }}
                  >
                    {meal.strArea}
                  </span>
                )}
              </div>

              {/* Heart Stash Button on Image */}
              <button
                className={`card-favorite-action ${isStashed ? 'active' : ''} ${isHeartPopping ? 'animate-heart-pop' : ''}`}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 2 }}
                onClick={handleStashClick}
                title={isStashed ? 'Already in your stash' : 'Stash recipe'}
                aria-label={isStashed ? 'In stash' : 'Stash recipe'}
              >
                <Heart
                  size={19}
                  fill={isStashed ? 'var(--primary-coral)' : 'none'}
                  color={isStashed ? 'var(--primary-coral)' : 'currentColor'}
                />
              </button>
            </div>

            {/* Right Information Pane */}
            <div className="recipe-modal-content">
              {/* Header with Source & Close Button */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={14} />
                  <span>TheMealDB Discovery</span>
                </div>

                <button
                  className="modal-close-btn"
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Recipe Title */}
              <h1
                id="recipe-modal-title"
                className="font-serif"
                style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.22 }}
              >
                {meal.strMeal}
              </h1>

              {/* Action Bar (Stash + Links) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.85rem 1.15rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '20px',
                  border: '1px solid var(--border-warm)',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  id="modal-stash-action-btn"
                  className={isStashed ? 'btn-stash-secondary' : 'btn-stash-primary'}
                  onClick={handleStashClick}
                  style={{ padding: '0.6rem 1.3rem', fontSize: '0.9rem' }}
                >
                  <Heart
                    size={16}
                    fill={isStashed ? 'var(--primary-coral)' : '#FFFFFF'}
                    color={isStashed ? 'var(--primary-coral)' : '#FFFFFF'}
                  />
                  <span>{isStashed ? '✓ In My Stash' : '♡ Stash Recipe'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {meal.strYoutube && (
                    <a
                      href={meal.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-stash-secondary"
                      style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', color: '#DC2626' }}
                    >
                      <Video size={15} />
                      <span>Video</span>
                    </a>
                  )}
                  {meal.strSource && (
                    <a
                      href={meal.strSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-stash-secondary"
                      style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      <Globe size={15} />
                      <span>Source ↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Ingredients Checklist */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    Ingredients ({ingredients.length})
                  </h3>
                  {ingredients.length > 0 && (
                    <button
                      onClick={copyIngredients}
                      className="btn-stash-peach"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      <Copy size={13} />
                      <span>Copy Ingredients</span>
                    </button>
                  )}
                </div>

                <div className="ingredient-checklist">
                  {ingredients.map((item, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    return (
                      <div
                        key={idx}
                        className={`ingredient-check-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleCheck(idx)}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            toggleCheck(idx);
                          }
                        }}
                      >
                        <div className="checkbox-custom">
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                          {item.measure && <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>{item.measure}</span>}
                          {item.ingredient}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preparation Instructions */}
              {meal.strInstructions && (
                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Preparation Instructions
                  </h3>
                  <div
                    style={{
                      padding: '1.1rem 1.25rem',
                      backgroundColor: 'var(--bg-cream)',
                      borderRadius: '20px',
                      border: '1px solid var(--border-warm)',
                      fontSize: '0.92rem',
                      color: 'var(--text-body)',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {meal.strInstructions}
                  </div>
                </div>
              )}

              {/* Attribution */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Recipe data & imagery powered by{' '}
                <a
                  href="https://www.themealdb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-coral)', fontWeight: 700 }}
                >
                  TheMealDB
                </a>
              </div>
            </div>
          </>
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Recipe not found.</p>
            <button className="btn-stash-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MealDetailModal;
