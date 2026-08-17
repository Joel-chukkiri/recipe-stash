import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Heart, Check, Copy, Edit3, Trash2, Calendar } from 'lucide-react';
import { getRecipeImage } from '../utils/imageHelper';
import { formatDomain, sanitizeUrl } from '../utils/urlHelper';

export const RecipeDetailModal = ({
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

  const imageUrl = getRecipeImage(recipe.title, recipe.category);
  const domain = formatDomain(recipe.source_url);
  const ingredients = recipe.parsed_ingredients || [];

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
      onShowToast('Ingredients copied to clipboard!', 'success');
    }
  };

  const formattedDate = new Date(recipe.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const modalContent = (
    <div className="recipe-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog recipe-detail-dialog"
        style={{
          maxWidth: '640px',
          width: '100%',
          backgroundColor: 'var(--bg-white)',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid var(--border-warm)',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Hero image with close & favorite overlay */}
        <div style={{ position: 'relative' }}>
          <img
            src={imageUrl}
            alt={recipe.title}
            className="detail-hero-image"
            style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 2,
            }}
          >
            <button
              className={`card-favorite-btn ${recipe.is_favorite ? 'favorited' : ''}`}
              onClick={() => onToggleFavorite(recipe)}
              title={recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={18}
                fill={recipe.is_favorite ? '#F2555F' : 'none'}
                color={recipe.is_favorite ? '#F2555F' : 'currentColor'}
              />
            </button>
            <button
              className="modal-close-btn"
              onClick={onClose}
              style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
            >
              <X size={18} />
            </button>
          </div>

          {recipe.category && (
            <span
              className="card-category-badge"
              style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2 }}
            >
              {recipe.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="modal-body" style={{ padding: '1.5rem 1.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Header Info */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#6B7478', marginBottom: '0.4rem' }}>
              <Calendar size={14} />
              <span>Saved on {formattedDate}</span>
              <span>•</span>
              <a
                href={sanitizeUrl(recipe.source_url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#F2555F', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
              >
                {domain} <ExternalLink size={12} />
              </a>
            </div>

            <h1 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17252D', lineHeight: 1.25 }}>
              {recipe.title}
            </h1>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#FFF9F5',
              borderRadius: '16px',
              border: '1px solid #F1E6DF',
              marginBottom: '1.5rem',
            }}
          >
            <a
              href={sanitizeUrl(recipe.source_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
            >
              <ExternalLink size={15} />
              <span>Open Original Recipe</span>
            </a>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => {
                  onClose();
                  onEdit(recipe);
                }}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', color: '#EF4444' }}
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

          {/* Ingredients Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#17252D' }}>
                Ingredients ({ingredients.length})
              </h3>
              <button
                onClick={copyIngredients}
                className="btn btn-soft"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <Copy size={13} />
                <span>Copy Ingredients</span>
              </button>
            </div>

            <div className="ingredient-checklist">
              {ingredients.map((ing, idx) => {
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
              })}
            </div>
          </div>

          {/* Notes Section */}
          {recipe.notes && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#17252D', marginBottom: '0.5rem' }}>
                Chef's Notes & Instructions
              </h3>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#FFF9F5',
                  borderRadius: '16px',
                  border: '1px solid #F1E6DF',
                  fontSize: '0.92rem',
                  color: '#37474F',
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

export default RecipeDetailModal;
