import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Link, AlignLeft, Tag, FileText } from 'lucide-react';

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

export const RecipeModal = ({ isOpen, onClose, onSave, recipeToEdit }) => {
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required.';
    }
    if (!formData.source_url.trim()) {
      newErrors.source_url = 'Source URL is required.';
    } else {
      // Basic URL format validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?/i;
      if (!urlPattern.test(formData.source_url.trim())) {
        newErrors.source_url = 'Please enter a valid recipe URL.';
      }
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
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'var(--bg-white)',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid var(--border-warm)',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title font-serif">
              {isEditing ? 'Edit Recipe' : 'Add a recipe'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update the details for your saved recipe.'
                : 'Save your favorite recipe for later.'}
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="recipe-title" className="form-label">
                <span>Recipe title *</span>
              </label>
              <input
                id="recipe-title"
                type="text"
                className="form-input"
                placeholder="e.g. Creamy Tuscan Garlic Salmon"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Source URL */}
            <div className="form-group">
              <label htmlFor="recipe-url" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Link size={14} color="#6B7478" />
                  Recipe URL *
                </span>
              </label>
              <input
                id="recipe-url"
                type="text"
                className="form-input"
                placeholder="e.g. https://instagram.com/p/... or https://allrecipes.com/..."
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              />
              {errors.source_url && <span className="form-error">{errors.source_url}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="recipe-category" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={14} color="#6B7478" />
                  Category
                </span>
              </label>
              <select
                id="recipe-category"
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

            {/* Ingredients */}
            <div className="form-group">
              <label htmlFor="recipe-ingredients" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlignLeft size={14} color="#6B7478" />
                  Ingredients *
                </span>
                <span className="form-helper">One ingredient per line</span>
              </label>
              <textarea
                id="recipe-ingredients"
                className="form-textarea"
                rows={5}
                placeholder={"2 Salmon fillets\n1 cup heavy cream\n3 cloves minced garlic\n1/2 cup sun-dried tomatoes\n2 cups fresh baby spinach"}
                value={formData.ingredients_list}
                onChange={(e) => setFormData({ ...formData, ingredients_list: e.target.value })}
              />
              {errors.ingredients_list && <span className="form-error">{errors.ingredients_list}</span>}
            </div>

            {/* Notes / Instructions */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="recipe-notes" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} color="#6B7478" />
                  Cooking Notes / Tips (optional)
                </span>
              </label>
              <textarea
                id="recipe-notes"
                className="form-textarea"
                rows={3}
                placeholder="e.g. Sear salmon for 4 minutes per side. Cook with medium flame..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="save-recipe-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RecipeModal;
