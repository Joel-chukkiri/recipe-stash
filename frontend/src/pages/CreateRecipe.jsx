import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Link as LinkIcon, Tag, AlignLeft, FileText, Sparkles, ChevronRight, Eye, Check, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import EditorialNavbar from '../components/EditorialNavbar';
import RecipeCard from '../components/RecipeCard';
import Toast from '../components/Toast';

const CATEGORIES = [
  'Dinner',
  'Lunch',
  'Breakfast',
  'Dessert',
  'Baking',
  'Pasta',
  'Seafood',
  'Chicken',
  'Beef',
  'Vegetarian',
  'Snack',
  'Drink',
  'Other',
];

export const CreateRecipe = () => {
  const navigate = useNavigate();

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required.';
    }
    if (!formData.source_url.trim()) {
      newErrors.source_url = 'Please provide a source URL or bookmark link.';
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
      await api.post('/recipes/', {
        ...formData,
        source_type: 'custom',
      });
      setSaveSuccess(true);
      showToast('Recipe added to your stash ❤️', 'success');
      setTimeout(() => {
        navigate('/stash');
      }, 900);
    } catch (err) {
      console.error('Error creating recipe:', err);
      showToast('Unable to save recipe. Please check your inputs and try again.', 'error');
      setIsSubmitting(false);
    }
  };

  // Live preview data object
  const previewRecipe = {
    title: formData.title || 'Crispy Honey Garlic Butter Chicken',
    category: formData.category,
    source_url: formData.source_url || 'https://recipestash.app',
    ingredients_list: formData.ingredients_list || '4 Chicken breasts\n3 tbsp Honey\n4 cloves Minced garlic\n2 tbsp Butter\n1 tbsp Soy sauce',
    notes: formData.notes,
    source_type: 'custom',
  };

  return (
    <div className="site-container page-entrance">
      <EditorialNavbar onOpenAddModal={() => {}} />

      <main className="editor-page-container">
        {/* Breadcrumb Navigation */}
        <nav className="editor-breadcrumb" aria-label="Breadcrumb">
          <Link to="/stash" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} />
            <span>My Stash</span>
          </Link>
          <ChevronRight size={14} color="var(--text-light)" />
          <span className="editor-breadcrumb-current">Create Recipe</span>
        </nav>

        {/* Page Header Area */}
        <div className="editor-header-area">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <Sparkles size={14} />
            <span>Personal Cookbook Editor</span>
          </div>
          <h1 className="editor-title font-serif">Create Your Recipe</h1>
          <p className="editor-subtitle">
            Add a recipe to your personal stash. Fill in the details below and watch your card update live.
          </p>
        </div>

        {/* Two-Column Editor Layout */}
        <div className="editor-two-col-grid">
          {/* Left: Recipe Form */}
          <div className="editor-form-card">
            <div className="editor-card-header">
              <span className="editor-card-heading">
                <Plus size={15} color="var(--primary-coral)" />
                <span>Recipe Details</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                * Required fields
              </span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Title */}
              <div className="form-group">
                <label htmlFor="recipe-title-input" className="form-label">
                  <span>Recipe Title *</span>
                </label>
                <input
                  id="recipe-title-input"
                  type="text"
                  className="form-input"
                  placeholder="Crispy Honey Garlic Butter Chicken"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              {/* Source URL */}
              <div className="form-group">
                <label htmlFor="recipe-source-input" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LinkIcon size={14} color="var(--text-muted)" />
                    Source URL *
                  </span>
                </label>
                <input
                  id="recipe-source-input"
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                />
                {errors.source_url && <span className="form-error">{errors.source_url}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="recipe-category-select" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={14} color="var(--text-muted)" />
                    Category
                  </span>
                </label>
                <select
                  id="recipe-category-select"
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
                <label htmlFor="recipe-ingredients-input" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlignLeft size={14} color="var(--text-muted)" />
                    Ingredients *
                  </span>
                  <span className="form-helper">Add ingredients one per line.</span>
                </label>
                <textarea
                  id="recipe-ingredients-input"
                  className="form-textarea"
                  rows={5}
                  placeholder={"2 Salmon fillets\n1 cup Heavy cream\n4 cloves Minced garlic\n1/2 cup Sun-dried tomatoes\n2 cups Baby spinach"}
                  value={formData.ingredients_list}
                  onChange={(e) => setFormData({ ...formData, ingredients_list: e.target.value })}
                />
                {errors.ingredients_list && <span className="form-error">{errors.ingredients_list}</span>}
              </div>

              {/* Chef's Notes */}
              <div className="form-group">
                <label htmlFor="recipe-notes-input" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={14} color="var(--text-muted)" />
                    Chef's Notes
                  </span>
                  <span className="form-helper">Optional</span>
                </label>
                <textarea
                  id="recipe-notes-input"
                  className="form-textarea"
                  rows={3}
                  placeholder="Optional tips, substitutions, preparation notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div className="editor-actions-row">
                <button
                  type="button"
                  className="btn-stash-secondary"
                  onClick={() => navigate('/stash')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  id="save-recipe-submit-btn"
                  type="submit"
                  className="btn-stash-primary"
                  disabled={isSubmitting || saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={17} strokeWidth={2.8} />
                      <span>✓ Saved!</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Plus size={17} strokeWidth={2.8} />
                      <span>Save Recipe</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Real-time Live Preview */}
          <div className="editor-preview-card">
            <div className="editor-card-header">
              <span className="editor-card-heading">
                <Eye size={15} color="var(--primary-coral)" />
                <span>LIVE PREVIEW</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Real-time Card
              </span>
            </div>

            <div style={{ transition: 'all 0.3s ease' }}>
              <RecipeCard recipe={previewRecipe} previewMode={true} />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.25rem', textAlign: 'center', fontStyle: 'italic' }}>
              This is how your recipe card will appear in your private stash collection.
            </p>
          </div>
        </div>
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default CreateRecipe;
