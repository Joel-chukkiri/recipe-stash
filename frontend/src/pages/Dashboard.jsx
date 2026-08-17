import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import EditorialNavbar from '../components/EditorialNavbar';
import EditorialHero from '../components/EditorialHero';
import CategoryExplorer from '../components/CategoryExplorer';
import PromoStashBanner from '../components/PromoStashBanner';
import EditorialRecipeGrid from '../components/EditorialRecipeGrid';
import InspirationSection from '../components/InspirationSection';
import MoodCollections from '../components/MoodCollections';
import EditorialAddModal from '../components/EditorialAddModal';
import EditorialDetailModal from '../components/EditorialDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import MobileNav from '../components/MobileNav';

export const Dashboard = () => {
  const { user } = useAuth();

  // Recipe Stash Data State
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({
    total_recipes: 0,
    this_month: 0,
    favorite_recipes: 0,
    unique_ingredients_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('-created_at');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
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

  // Fetch User's Recipes
  const fetchRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (showFavoritesOnly) params.favorite = 'true';
      if (sortBy) params.ordering = sortBy;

      const response = await api.get('/recipes/', { params });
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      showToast('Unable to load recipes. Please check connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, showFavoritesOnly, sortBy, showToast]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/recipes/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Scroll Helper
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Save Recipe (Create / Update)
  const handleSaveRecipe = async (formData, recipeId) => {
    try {
      if (recipeId) {
        const response = await api.put(`/recipes/${recipeId}/`, formData);
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? response.data : r))
        );
        if (viewingRecipe?.id === recipeId) {
          setViewingRecipe(response.data);
        }
        showToast('Recipe updated in your stash!', 'success');
      } else {
        const response = await api.post('/recipes/', formData);
        setRecipes((prev) => [response.data, ...prev]);
        showToast('Recipe successfully stashed!', 'success');
      }
      fetchStats();
      setIsAddModalOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      showToast(
        error.response?.data?.detail || 'Unable to save recipe. Please check your inputs.',
        'error'
      );
      throw error;
    }
  };

  // Handle 1-Click Save from Inspiration Section
  const handleSaveInspiration = async (inspRecipe) => {
    try {
      const payload = {
        title: inspRecipe.title,
        source_url: inspRecipe.source_url,
        category: inspRecipe.category,
        ingredients_list: inspRecipe.ingredients_list,
        notes: inspRecipe.notes,
        is_favorite: true,
      };
      const response = await api.post('/recipes/', payload);
      setRecipes((prev) => [response.data, ...prev]);
      fetchStats();
      showToast(`"${inspRecipe.title}" added to your stash! ★`, 'success');
      scrollToSection('stash-section');
    } catch (error) {
      console.error('Error saving inspiration:', error);
      showToast('Could not stash recipe. Try adding manually.', 'error');
    }
  };

  // Handle Delete Recipe
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
    } catch (error) {
      console.error('Error deleting recipe:', error);
      showToast('Failed to delete recipe. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async (recipe) => {
    const updated = { ...recipe, is_favorite: !recipe.is_favorite };
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? updated : r))
    );
    if (viewingRecipe?.id === recipe.id) {
      setViewingRecipe(updated);
    }

    try {
      const response = await api.post(`/recipes/${recipe.id}/toggle-favorite/`);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? response.data : r))
      );
      if (viewingRecipe?.id === recipe.id) {
        setViewingRecipe(response.data);
      }
      fetchStats();
      showToast(
        response.data.is_favorite ? 'Added to favorites! ★' : 'Removed from favorites',
        'info'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? recipe : r))
      );
      showToast('Unable to update favorite status.', 'error');
    }
  };

  return (
    <div className="site-container">
      {/* Editorial Sticky Header */}
      <EditorialNavbar
        onOpenAddModal={() => {
          setEditingRecipe(null);
          setIsAddModalOpen(true);
        }}
        totalRecipes={stats.total_recipes}
        onScrollToSection={scrollToSection}
      />

      {/* Main Content Showcase */}
      <main className="main-content">
        {/* Editorial Hero Showcase */}
        <EditorialHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectChip={(chip) => {
            setSelectedCategory(chip);
            scrollToSection('stash-section');
          }}
          onScrollToStash={() => scrollToSection('stash-section')}
        />

        {/* Category Explorer ("What are you craving?") */}
        <CategoryExplorer
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setShowFavoritesOnly(false);
          }}
          onScrollToStash={() => scrollToSection('stash-section')}
        />

        {/* Callout Promo Banner */}
        <PromoStashBanner
          onOpenAddModal={() => {
            setEditingRecipe(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* From Your Stash (User's Saved Recipes) */}
        <EditorialRecipeGrid
          recipes={recipes}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectRecipe={(recipe) => setViewingRecipe(recipe)}
          onEditRecipe={(recipe) => {
            setEditingRecipe(recipe);
            setIsAddModalOpen(true);
          }}
          onDeleteRecipe={(recipe) => setDeletingRecipe(recipe)}
          onToggleFavorite={handleToggleFavorite}
          onOpenAddModal={() => {
            setEditingRecipe(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* Inspiration for Tonight Section */}
        <InspirationSection onSaveInspiration={handleSaveInspiration} />

        {/* Explore by Mood / Collections */}
        <MoodCollections
          onSelectMood={(moodCat) => {
            setSelectedCategory(moodCat);
            setShowFavoritesOnly(false);
          }}
          onScrollToStash={() => scrollToSection('stash-section')}
        />
      </main>

      {/* Mobile Floating Action Button & Bottom Bar */}
      <MobileNav
        activeSection={showFavoritesOnly ? 'stash' : 'hero'}
        onScrollToSection={scrollToSection}
        onOpenAddModal={() => {
          setEditingRecipe(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Recipe Modal */}
      <EditorialAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipe}
        recipeToEdit={editingRecipe}
      />

      {/* Recipe Detail Split Magazine Modal */}
      <EditorialDetailModal
        recipe={viewingRecipe}
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        onEdit={(recipe) => {
          setEditingRecipe(recipe);
          setIsAddModalOpen(true);
        }}
        onDelete={(recipe) => setDeletingRecipe(recipe)}
        onToggleFavorite={handleToggleFavorite}
        onShowToast={showToast}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingRecipe}
        title="Remove recipe from stash?"
        message={`"${deletingRecipe?.title}" will be permanently removed from your personal stash.`}
        confirmText="Remove Recipe"
        cancelText="Keep Recipe"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingRecipe(null)}
        isProcessing={isDeleting}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Dashboard;
