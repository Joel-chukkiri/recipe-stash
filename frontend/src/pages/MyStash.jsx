import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Compass, ChefHat, Heart, Trash2, Edit3, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../api/axios';
import EditorialNavbar from '../components/EditorialNavbar';
import MobileNav from '../components/MobileNav';
import RecipeCard from '../components/RecipeCard';
import EditorialDetailModal from '../components/EditorialDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';

const SOURCE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'custom', label: 'My Recipes' },
  { id: 'themealdb', label: 'Stashed Recipes' },
  { id: 'favorites', label: '★ Favorites' },
];

export const MyStash = () => {
  const navigate = useNavigate();

  // Stash Data State
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({
    total_recipes: 0,
    custom_recipes: 0,
    themealdb_recipes: 0,
    favorite_recipes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceTab, setSelectedSourceTab] = useState('all');
  const [sortBy, setSortBy] = useState('-created_at');

  // Modals
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch user's personal stash from Django backend
  const fetchStash = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSourceTab === 'custom') params.source_type = 'custom';
      if (selectedSourceTab === 'themealdb') params.source_type = 'themealdb';
      if (selectedSourceTab === 'favorites') params.favorite = 'true';
      if (sortBy) params.ordering = sortBy;

      const response = await api.get('/recipes/', { params });
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching personal stash:', err);
      showToast('Could not load stash. Please try refreshing.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSourceTab, sortBy, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/recipes/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Could not fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStash();
  }, [fetchStash]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecipe) return;
    setIsDeleting(true);
    try {
      await api.delete(`/recipes/${deletingRecipe.id}/`);
      setRecipes((prev) => prev.filter((r) => r.id !== deletingRecipe.id));
      if (viewingRecipe?.id === deletingRecipe.id) {
        setViewingRecipe(null);
      }
      showToast('Recipe removed from your stash.', 'success');
      fetchStats();
      setDeletingRecipe(null);
    } catch (err) {
      showToast('Failed to delete recipe.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async (recipe) => {
    const updated = { ...recipe, is_favorite: !recipe.is_favorite };
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? updated : r)));
    if (viewingRecipe?.id === recipe.id) setViewingRecipe(updated);

    try {
      const res = await api.post(`/recipes/${recipe.id}/toggle-favorite/`);
      setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? res.data : r)));
      if (viewingRecipe?.id === recipe.id) setViewingRecipe(res.data);
      fetchStats();
      showToast(res.data.is_favorite ? 'Added to favorites! ★' : 'Removed from favorites', 'info');
    } catch (err) {
      setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? recipe : r)));
    }
  };

  return (
    <div className="site-container page-entrance">
      {/* Header */}
      <EditorialNavbar
        onOpenAddModal={() => navigate('/create-recipe')}
        totalRecipes={stats.total_recipes}
        onScrollToSection={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main className="main-content">
        {/* Page Top Header */}
        <section style={{ padding: '2.5rem 0 1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                <ChefHat size={14} />
                <span>Your Private Collection</span>
              </div>
              <h1 className="font-serif" style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                My Stash
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                Your personal collection of recipes worth making again.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn-stash-secondary"
                onClick={() => navigate('/discover')}
              >
                <Compass size={18} color="var(--primary-coral)" />
                <span>Explore TheMealDB</span>
              </button>

              <button
                id="stash-create-recipe-btn"
                className="btn-stash-primary"
                onClick={() => navigate('/create-recipe')}
              >
                <Plus size={18} strokeWidth={2.8} />
                <span>+ Create Recipe</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hero-search-box" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            <Search size={20} color="var(--primary-coral)" />
            <input
              id="stash-search-input"
              type="text"
              className="hero-search-input"
              placeholder="Search your stash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Source Filter Tabs & Sorting Bar */}
          <div className="stash-controls-bar">
            <div className="stash-filter-tabs">
              {SOURCE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`stash-filter-btn ${selectedSourceTab === tab.id ? 'active' : ''}`}
                  onClick={() => setSelectedSourceTab(tab.id)}
                >
                  {tab.label}
                  {tab.id === 'all' && ` (${stats.total_recipes || 0})`}
                  {tab.id === 'custom' && ` (${stats.custom_recipes || 0})`}
                  {tab.id === 'themealdb' && ` (${stats.themealdb_recipes || 0})`}
                  {tab.id === 'favorites' && ` (${stats.favorite_recipes || 0})`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <select
                id="sort-select-stash"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-white)',
                  border: '1.5px solid var(--border-warm)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                }}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Recipes Grid */}
        <section aria-label="Personal Stash Grid">
          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : recipes.length === 0 ? (
            <EmptyState
              isFiltered={!!searchQuery || selectedSourceTab !== 'all'}
              searchQuery={searchQuery}
              onOpenAddModal={() => navigate('/create-recipe')}
            />
          ) : (
            <div className="stash-recipe-grid">
              {recipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onSelectRecipe={(recipe) => setViewingRecipe(recipe)}
                  onEditRecipe={(recipe) => navigate(`/recipes/${recipe.id}/edit`)}
                  onDeleteRecipe={(recipe) => setDeletingRecipe(recipe)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        activeSection="stash"
        onScrollToSection={(id) => {
          if (id === 'discover') navigate('/discover');
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddModal={() => navigate('/create-recipe')}
      />

      {/* Recipe Detail Modal */}
      <EditorialDetailModal
        recipe={viewingRecipe}
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        onEdit={(recipe) => {
          setViewingRecipe(null);
          navigate(`/recipes/${recipe.id}/edit`);
        }}
        onDelete={(recipe) => setDeletingRecipe(recipe)}
        onToggleFavorite={handleToggleFavorite}
        onShowToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingRecipe}
        title="Remove recipe?"
        message={`Are you sure you want to remove "${deletingRecipe?.title}" from your personal stash?`}
        confirmText="Remove Recipe"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingRecipe(null)}
        isProcessing={isDeleting}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default MyStash;
