import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Link, AlignLeft, Tag, FileText, Eye } from 'lucide-react';
import { getRecipeImage } from '../utils/imageHelper';
import { formatDomain } from '../utils/urlHelper';

const CATEGORIES = [
  'Dinner',
  'Lunch',
  'Breakfast',
  'Dessert',
  'Baking',
  'Drink',
  'Snack',
  'Other',
];

export const EditorialAddModal = ({ isOpen, onClose, onSave, recipeToEdit }) => {
  const isEditing = !!recipeToEdit;

  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    category: 'Dinner',
    ingredients_list: '',
    notes: '',
    is_favorite: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recipeToEdit) {
      setFormData({
        title: recipeToEdit.title || '',
        source_url: recipeToEdit.source_url || '',
        category: recipeToEdit.category || 'Dinner',
        ingredients_list: recipeToEdit.ingredients_list || '',
        notes: recipeToEdit.notes || '',
        is_favorite: recipeToEdit.is_favorite || false,
      });
    } else {
      setFormData({
        title: '',
        source_url: '',
        category: 'Dinner',
        ingredients_list: '',
        notes: '',
        is_favorite: false,
      });
    }
    setErrors({});
  }, [recipeToEdit, isOpen]);

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

  const previewImage = getRecipeImage(formData.title, formData.category);
  const previewDomain = formatDomain(formData.source_url);
  const parsedIngredients = formData.ingredients_list
    ? formData.ingredients_list.split('\n').filter((l) => l.trim().length > 0)
    : [];

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a recipe title.';
    }
    if (!formData.source_url.trim()) {
      newErrors.source_url = 'Please provide the recipe source URL.';
    }
    if (!formData.ingredients_list.trim()) {
      newErrors.ingredients_list = 'Please add at least one ingredient.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData, recipeToEdit?.id);
      onClose();
    } catch (err) {
      console.error('Error saving recipe:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="recipe-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '820px',
          width: '100%',
          borderRadius: '32px',
          backgroundColor: 'var(--bg-white)',
          border: '1px solid var(--border-warm)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.75rem 2rem 1.25rem 2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
              <Sparkles size={14} />
              <span>{isEditing ? 'Update Stashed Recipe' : 'Add to Your Collection'}</span>
            </div>
            <h2 className="modal-title font-serif" style={{ fontSize: '1.75rem' }}>
              {isEditing ? 'Edit Recipe Details' : 'Stash a New Recipe'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body with Split Preview */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem 2rem' }}>
            <div className="add-modal-grid">
              {/* Form Inputs */}
              <div>
                <div className="form-group">
                  <label htmlFor="modal-title-input" className="form-label">
                    <span>Recipe Title *</span>
                  </label>
                  <input
                    id="modal-title-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Creamy Tuscan Garlic Salmon"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    autoFocus
                  />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="modal-url-input" className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Link size={14} color="var(--text-muted)" />
                      Recipe Source URL *
                    </span>
                  </label>
                  <input
                    id="modal-url-input"
                    type="text"
                    className="form-input"
                    placeholder="https://instagram.com/p/... or https://food.com/..."
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  />
                  {errors.source_url && <span className="form-error">{errors.source_url}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="modal-cat-select" className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tag size={14} color="var(--text-muted)" />
                      Category
                    </span>
                  </label>
                  <select
                    id="modal-cat-select"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-ingredients-area" className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlignLeft size={14} color="var(--text-muted)" />
                      Ingredients List *
                    </span>
                    <span className="form-helper">1 ingredient per line</span>
                  </label>
                  <textarea
                    id="modal-ingredients-area"
                    className="form-textarea"
                    rows={4}
                    placeholder={"2 Salmon fillets\n1 cup Heavy cream\n4 cloves Minced garlic\n1/2 cup Sun-dried tomatoes\n2 cups Baby spinach"}
                    value={formData.ingredients_list}
                    onChange={(e) => setFormData({ ...formData, ingredients_list: e.target.value })}
                  />
                  {errors.ingredients_list && <span className="form-error">{errors.ingredients_list}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="modal-notes-area" className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="var(--text-muted)" />
                      Chef's Notes / Tips (Optional)
                    </span>
                  </label>
                  <textarea
                    id="modal-notes-area"
                    className="form-textarea"
                    rows={2}
                    placeholder="Cook salmon on medium heat for 4 minutes per side..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="live-preview-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Eye size={15} color="var(--primary-coral)" />
                  <span>Card Preview</span>
                </div>

                <div className="editorial-card" style={{ margin: 0, boxShadow: 'var(--shadow-card)' }}>
                  <div className="card-top-media" style={{ height: '170px' }}>
                    <img src={previewImage} alt="Preview" />
                    <span className="card-top-category">{formData.category || 'Recipe'}</span>
                  </div>

                  <div className="card-details-body" style={{ padding: '1rem' }}>
                    <h4 className="card-recipe-title font-serif" style={{ fontSize: '1.05rem' }}>
                      {formData.title.trim() || 'Recipe Title Appears Here'}
                    </h4>

                    <div className="card-ingredient-tags">
                      {parsedIngredients.length > 0 ? (
                        parsedIngredients.slice(0, 2).map((ing, i) => (
                          <span key={i} className="ingredient-badge">
                            {ing.length > 18 ? ing.substring(0, 16) + '…' : ing}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Ingredients will preview here...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-bottom-bar" style={{ padding: '0.65rem 1rem' }}>
                    <span className="card-source-domain">
                      Saved from {previewDomain}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ padding: '1.25rem 2rem 1.75rem 2rem' }}>
            <button
              type="button"
              className="btn-stash-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="save-recipe-modal-submit"
              type="submit"
              className="btn-stash-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Stashing...'
                : isEditing
                ? 'Save Changes'
                : 'Save to My Stash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditorialAddModal;
