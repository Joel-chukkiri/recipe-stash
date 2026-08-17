import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Edit3, Link as LinkIcon, Tag, AlignLeft, FileText, Sparkles, ChevronRight, Eye, Check, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import EditorialNavbar from '../components/EditorialNavbar';
import RecipeCard from '../components/RecipeCard';
import ConfirmModal from '../components/ConfirmModal';
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

export const EditRecipe = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    category: 'Dinner',
    ingredients_list: '',
    notes: '',
    is_favorite: false,
    image_url: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const toastId = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Fetch recipe details
  const fetchRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/recipes/${id}/`);
      setRecipe(res.data);
      setFormData({
        title: res.data.title || '',
        source_url: res.data.source_url || '',
        category: res.data.category || 'Dinner',
        ingredients_list: res.data.ingredients_list || '',
        notes: res.data.notes || '',
        is_favorite: res.data.is_favorite || false,
        image_url: res.data.image_url || '',
      });
    } catch (err) {
      console.error('Error fetching recipe for edit:', err);
      showToast('Unable to load recipe details. Returning to stash.', 'error');
      setTimeout(() => navigate('/stash'), 1500);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id, fetchRecipe]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required.';
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
      await api.put(`/recipes/${id}/`, formData);
      setSaveSuccess(true);
      showToast('Recipe updated successfully.', 'success');
      setTimeout(() => {
        navigate('/stash');
      }, 900);
    } catch (err) {
      console.error('Error updating recipe:', err);
      showToast('Unable to save recipe. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/recipes/${id}/`);
      showToast('Recipe removed from your stash.', 'success');
      setTimeout(() => {
        navigate('/stash');
      }, 600);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      showToast('Failed to remove recipe. Please try again.', 'error');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Live preview data
  const previewRecipe = {
    title: formData.title || 'Crispy Honey Garlic Butter Chicken',
    category: formData.category,
    source_url: formData.source_url || 'https://recipestash.app',
    ingredients_list: formData.ingredients_list || '4 Chicken breasts\n3 tbsp Honey\n4 cloves Minced garlic\n2 tbsp Butter',
    notes: formData.notes,
    image_url: formData.image_url,
    source_type: recipe?.source_type || 'custom',
    is_favorite: formData.is_favorite,
  };

  if (isLoading) {
    return (
      <div className="site-container">
        <EditorialNavbar onOpenAddModal={() => {}} />
        <main className="editor-page-container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid var(--bg-peach)',
              borderTopColor: 'var(--primary-coral)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem auto',
            }}
          />
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>
            Loading Recipe Editor...
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Preparing your recipe details and live preview canvas.
          </p>
        </main>
      </div>
    );
  }

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
          <span className="editor-breadcrumb-current">Edit Recipe</span>
        </nav>

        {/* Page Header Area */}
        <div className="editor-header-area">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <Edit3 size={14} />
            <span>Edit Recipe Details</span>
          </div>
          <h1 className="editor-title font-serif">Edit Recipe Details</h1>
          <p className="editor-subtitle">
            Refine your recipe and keep your personal stash organized.
          </p>
        </div>

        {/* Two-Column Editor Layout */}
        <div className="editor-two-col-grid">
          {/* Left: Recipe Form */}
          <div className="editor-form-card">
            <div className="editor-card-header">
              <span className="editor-card-heading">
                <Edit3 size={15} color="var(--primary-coral)" />
                <span>RECIPE DETAILS</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                * Required fields
              </span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Recipe Title */}
              <div className="form-group">
                <label htmlFor="edit-recipe-title" className="form-label">
                  <span>Recipe Title *</span>
                </label>
                <input
                  id="edit-recipe-title"
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
                <label htmlFor="edit-recipe-source" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LinkIcon size={14} color="var(--text-muted)" />
                    Source URL *
                  </span>
                </label>
                <input
                  id="edit-recipe-source"
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
                <label htmlFor="edit-recipe-category" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={14} color="var(--text-muted)" />
                    Category
                  </span>
                </label>
                <select
                  id="edit-recipe-category"
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
                <label htmlFor="edit-recipe-ingredients" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlignLeft size={14} color="var(--text-muted)" />
                    Ingredients *
                  </span>
                  <span className="form-helper">Add ingredients one per line.</span>
                </label>
                <textarea
                  id="edit-recipe-ingredients"
                  className="form-textarea"
                  rows={6}
                  placeholder={"2 Salmon fillets\n1 cup Heavy cream\n4 cloves Minced garlic\n1/2 cup Sun-dried tomatoes\n2 cups Baby spinach"}
                  value={formData.ingredients_list}
                  onChange={(e) => setFormData({ ...formData, ingredients_list: e.target.value })}
                />
                {errors.ingredients_list && <span className="form-error">{errors.ingredients_list}</span>}
              </div>

              {/* Chef's Notes */}
              <div className="form-group">
                <label htmlFor="edit-recipe-notes" className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={14} color="var(--text-muted)" />
                    Chef's Notes
                  </span>
                  <span className="form-helper">Optional tips, substitutions, preparation notes...</span>
                </label>
                <textarea
                  id="edit-recipe-notes"
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
                  id="save-changes-submit-btn"
                  type="submit"
                  className="btn-stash-primary"
                  disabled={isSubmitting || saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={17} strokeWidth={2.8} />
                      <span>✓ Changes Saved</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={17} strokeWidth={2.8} />
                      <span>Save Changes</span>
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
              Live preview dynamically reflects your title, category, and ingredients checklist.
            </p>
          </div>
        </div>

        {/* Danger Zone Section */}
        <section className="danger-zone-card" aria-label="Danger Zone">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <AlertTriangle size={18} />
              <span>Danger Zone</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Remove this recipe from your personal stash.
            </p>
          </div>

          <button
            id="danger-zone-remove-btn"
            type="button"
            className="btn-danger-restrained"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={15} />
            <span>Remove Recipe</span>
          </button>
        </section>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Remove recipe?"
        message={`Are you sure you want to remove "${formData.title || 'this recipe'}" from your stash? This action cannot be undone.`}
        confirmText="Remove Recipe"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isProcessing={isDeleting}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default EditRecipe;
