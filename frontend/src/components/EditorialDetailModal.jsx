import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Heart, Check, Copy, Edit3, Trash2, Calendar } from 'lucide-react';
import RecipeImage from './RecipeImage';
import { formatDomain, sanitizeUrl } from '../utils/urlHelper';

export const EditorialDetailModal = ({
  recipe,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShowToast,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState({});

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

  if (!isOpen || !recipe) return null;

  const domain = recipe.source_type === 'themealdb' ? 'themealdb.com' : formatDomain(recipe.source_url);
  
  let ingredients = [];
  if (Array.isArray(recipe.parsed_ingredients)) {
    ingredients = recipe.parsed_ingredients;
  } else if (typeof recipe.ingredients_list === 'string') {
    ingredients = recipe.ingredients_list
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  }

  const toggleCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyIngredients = () => {
    const text = ingredients.join('\n');
    navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast('Ingredients list copied to clipboard!', 'success');
    }
  };

  const formattedDate = new Date(recipe.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const modalContent = (
    <div
      className="recipe-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-detail-title"
    >
      <div
        className="recipe-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Large Full Image */}
        <div className="recipe-modal-image">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.title}
            title={recipe.title}
            category={recipe.category}
          />

          {recipe.category && (
            <span
              className="card-top-category"
              style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 2 }}
            >
              {recipe.category}
            </span>
          )}

          <button
            className={`card-favorite-action ${recipe.is_favorite ? 'active' : ''}`}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 2 }}
            onClick={() => onToggleFavorite(recipe)}
            title="Toggle favorite"
          >
            <Heart
              size={18}
              fill={recipe.is_favorite ? 'var(--primary-coral)' : 'none'}
              color={recipe.is_favorite ? 'var(--primary-coral)' : 'currentColor'}
            />
          </button>
        </div>

        {/* Right Side: Information Pane */}
        <div className="recipe-modal-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span>Saved on {formattedDate}</span>
              <span>•</span>
              <span style={{ color: 'var(--primary-coral)', fontWeight: 700 }}>
                {domain}
              </span>
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

          <h1
            id="editorial-detail-title"
            className="font-serif"
            style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.22 }}
          >
            {recipe.title}
          </h1>

          {/* Action Row */}
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
            {recipe.source_url ? (
              <a
                href={sanitizeUrl(recipe.source_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-stash-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
              >
                <ExternalLink size={15} />
                <span>Open Original Recipe ↗</span>
              </a>
            ) : (
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Private Recipe
              </span>
            )}

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-stash-secondary"
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => {
                  onClose();
                  onEdit(recipe);
                }}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                className="btn-stash-secondary"
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                onClick={() => {
                  onClose();
                  onDelete(recipe);
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Ingredients Section with interactive checklist */}
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
              {ingredients.length > 0 ? (
                ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <div
                      key={idx}
                      className={`ingredient-check-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleCheck(idx)}
                    >
                      <div className="checkbox-custom">
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{ing}</span>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No ingredients listed.
                </p>
              )}
            </div>
          </div>

          {/* Chef's Notes */}
          {recipe.notes && (
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Chef's Notes & Instructions
              </h3>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--bg-cream)',
                  borderRadius: '18px',
                  border: '1px solid var(--border-warm)',
                  fontSize: '0.92rem',
                  color: 'var(--text-body)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {recipe.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditorialDetailModal;
