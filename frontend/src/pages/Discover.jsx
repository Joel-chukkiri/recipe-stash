import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Sparkles, Dices, ArrowRight, RefreshCw, Globe, AlertCircle } from 'lucide-react';
import mealApi from '../services/mealApi';
import api from '../api/axios';
import EditorialNavbar from '../components/EditorialNavbar';
import MobileNav from '../components/MobileNav';
import MealDetailModal from '../components/MealDetailModal';
import EditorialAddModal from '../components/EditorialAddModal';
import { RecipeSkeletonGrid } from '../components/RecipeCardSkeleton';
import Toast from '../components/Toast';
import RecipeCard from '../components/RecipeCard';

const CUISINES = [
  'All',
  'Italian',
  'Mexican',
  'Indian',
  'Japanese',
  'French',
  'Chinese',
  'American',
  'British',
  'Greek',
  'Thai',
  'Spanish',
];

const POPULAR_CATEGORIES = [
  { name: 'Pasta', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80' },
  { name: 'Seafood', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Chicken', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dessert', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80' },
  { name: 'Vegetarian', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
  { name: 'Breakfast', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80' },
  { name: 'Beef', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
];

export const Discover = () => {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  // Synchronous cache initialization for 0ms initial render when returning to Discover
  const [meals, setMeals] = useState(() => mealApi.getCachedMealsSync('explore_default') || []);
  const [isLoading, setIsLoading] = useState(() => !mealApi.hasValidCache('explore_default'));
  const [error, setError] = useState('');

  // Search input state with 350ms debouncing
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Stashed IDs for current user
  const [stashedIds, setStashedIds] = useState(new Set());
  const [totalStashedCount, setTotalStashedCount] = useState(0);

  // Modals & Details
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Toast notifications
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

  // Search input debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Non-blocking parallel fetch of user's stashed IDs and counts
  const fetchStashedIds = useCallback(async () => {
    try {
      const [resStashed, resStats] = await Promise.allSettled([
        api.get('/recipes/stashed-ids/'),
        api.get('/recipes/stats/'),
      ]);

      if (resStashed.status === 'fulfilled' && resStashed.value.data?.stashed_ids) {
        setStashedIds(new Set(resStashed.value.data.stashed_ids));
      }
      if (resStats.status === 'fulfilled' && resStats.value.data?.total_recipes !== undefined) {
        setTotalStashedCount(resStats.value.data.total_recipes);
      }
    } catch (err) {
      console.error('Non-critical: could not fetch stashed IDs:', err);
    }
  }, []);

  useEffect(() => {
    fetchStashedIds();
  }, [fetchStashedIds]);

  // Fetch Meals from TheMealDB with SWR caching and AbortController
  const loadDiscoverMeals = useCallback(async (query, category, cuisine) => {
    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const trimmed = query.trim().toLowerCase();
    const cacheKey = trimmed
      ? `search_${trimmed}`
      : category
      ? `category_${category.trim().toLowerCase()}`
      : cuisine && cuisine !== 'All'
      ? `area_${cuisine.trim().toLowerCase()}`
      : 'explore_default';

    // Check synchronous cache first (display immediately with 0 delay)
    const cachedData = mealApi.getCachedMealsSync(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      setMeals(cachedData);
      setIsLoading(false);
      setError('');
    } else {
      setIsLoading(true);
      setError('');
    }

    try {
      let results = [];
      if (query.trim()) {
        results = await mealApi.searchMeals(query.trim(), controller.signal);
      } else if (category) {
        results = await mealApi.getMealsByCategory(category, controller.signal);
      } else if (cuisine && cuisine !== 'All') {
        results = await mealApi.getMealsByArea(cuisine, controller.signal);
      } else {
        results = await mealApi.searchMeals('', controller.signal);
      }

      if (!controller.signal.aborted) {
        setMeals(results || []);
        setError('');
        setIsLoading(false);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || axios.isCancel?.(err)) {
        return; // Request was aborted in favor of a newer search
      }
      console.error('Error fetching TheMealDB meals:', err);
      if (!cachedData || cachedData.length === 0) {
        setError("We couldn't load recipes from TheMealDB right now. Please try again.");
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscoverMeals(debouncedQuery, selectedCategory, selectedCuisine);
  }, [debouncedQuery, selectedCategory, selectedCuisine, loadDiscoverMeals]);

  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle Random Recipe generator (only on demand)
  const handleSurpriseMe = async () => {
    setIsLoading(true);
    try {
      const random = await mealApi.getRandomMeal();
      if (random) {
        setSelectedMealId(random.idMeal);
      }
    } catch (err) {
      showToast('Could not fetch a surprise meal. Try searching!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Stashing a TheMealDB Recipe into Django DB
  const handleStashTheMealDBRecipe = async (mealObj) => {
    if (stashedIds.has(mealObj.idMeal)) {
      showToast(`"${mealObj.strMeal}" is already in your Stash!`, 'info');
      return;
    }

    try {
      let fullMeal = mealObj;
      if (!mealObj.strInstructions) {
        fullMeal = await mealApi.getMealById(mealObj.idMeal);
      }

      const parsedIngredients = mealApi.parseMealIngredients(fullMeal);
      const ingredientsText = mealApi.formatIngredientsForStorage(parsedIngredients);

      const payload = {
        title: fullMeal.strMeal,
        source_url: fullMeal.strSource || fullMeal.strYoutube || `https://www.themealdb.com/meal/${fullMeal.idMeal}`,
        ingredients_list: ingredientsText || 'Ingredients available on TheMealDB',
        instructions: fullMeal.strInstructions || '',
        notes: fullMeal.strArea ? `Traditional ${fullMeal.strArea} recipe.` : '',
        category: fullMeal.strCategory || 'Dinner',
        area: fullMeal.strArea || '',
        image_url: fullMeal.strMealThumb,
        external_id: fullMeal.idMeal,
        source_type: 'themealdb',
        is_favorite: true,
      };

      await api.post('/recipes/', payload);

      setStashedIds((prev) => new Set([...prev, mealObj.idMeal]));
      setTotalStashedCount((prev) => prev + 1);
      showToast(`"${mealObj.strMeal}" added to your Stash! ❤️`, 'success');
    } catch (err) {
      console.error('Error stashing recipe:', err);
      showToast('Unable to stash recipe. Please try again.', 'error');
    }
  };

  return (
    <div className="site-container page-entrance">
      {/* Header */}
      <EditorialNavbar
        onOpenAddModal={() => navigate('/create-recipe')}
        totalRecipes={totalStashedCount}
        onScrollToSection={(id) => {
          if (id === 'stash-section') {
            navigate('/stash');
          } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <main className="main-content">
        {/* Discover Hero */}
        <section className="hero-editorial-section" aria-label="Discover Hero">
          <div className="hero-left-content">
            <div className="hero-badge-pill">
              <Sparkles size={14} />
              <span>Live Culinary Exploration</span>
            </div>

            <h1 className="hero-headline font-serif">
              DISCOVER SOMETHING <em>DELICIOUS.</em>
            </h1>

            <p className="hero-subtext">
              Search thousands of authentic recipes from around the world powered by TheMealDB. Browse by cuisine, find new weeknight inspirations, and stash what you love.
            </p>

            {/* Central Search Bar */}
            <div className="hero-search-box">
              <Search size={22} color="var(--primary-coral)" />
              <input
                id="discover-search-input"
                type="text"
                className="hero-search-input"
                placeholder="Search by meal name or ingredient (e.g. Pasta, Chicken, Curry)..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSelectedCategory('');
                  setSelectedCuisine('All');
                }}
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedQuery('');
                  }}
                  style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions: Surprise Me + Link to Stash */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                id="surprise-me-btn"
                className="btn-stash-secondary"
                onClick={handleSurpriseMe}
                style={{ padding: '0.65rem 1.3rem' }}
              >
                <Dices size={18} color="var(--primary-coral)" />
                <span>Surprise Me (Random Meal)</span>
              </button>

              <button
                className="btn-stash-peach"
                onClick={() => navigate('/stash')}
                style={{ padding: '0.65rem 1.3rem' }}
              >
                <span>View My Stash ({totalStashedCount}) →</span>
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hero-right-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85"
                alt="Delicious culinary bowl"
                loading="eager"
              />
            </div>
            <div className="floating-badge-top">
              <Sparkles size={16} color="var(--primary-coral)" />
              <span>Thousands of Dishes</span>
            </div>
            <div className="floating-card-bottom">
              <img
                src="https://www.themealdb.com/images/media/meals/58oia61564916529.jpg"
                alt="Corba soup"
                style={{ width: '46px', height: '46px', borderRadius: '12px', objectFit: 'cover' }}
                loading="eager"
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-dark)' }}>
                  Turkish Lentil Soup
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  TheMealDB Classic
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Explorer */}
        <section id="craving-section" style={{ margin: '2rem 0 3rem 0' }}>
          <div className="section-header-editorial">
            <div>
              <h2 className="section-title-editorial font-serif">
                Browse by Category
              </h2>
              <p className="section-subtitle-editorial">
                Select a category to explore authentic dishes from around the globe.
              </p>
            </div>
          </div>

          <div className="category-scroll-container">
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <div
                  key={cat.name}
                  className={`category-card-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(isSelected ? '' : cat.name);
                    setSelectedCuisine('All');
                    setSearchInput('');
                    setDebouncedQuery('');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-card-img-wrap">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                  <div className="category-card-content">
                    <span className="category-card-name">{cat.name}</span>
                    <ArrowRight size={15} className="category-card-arrow" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* World Cuisines Selector */}
        <section style={{ margin: '2rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Globe size={18} color="var(--primary-coral)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              World Cuisines:
            </span>
          </div>

          <div className="category-tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {CUISINES.map((area) => (
              <button
                key={area}
                className={`stash-filter-btn ${selectedCuisine === area ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCuisine(area);
                  setSelectedCategory('');
                  setSearchInput('');
                  setDebouncedQuery('');
                }}
              >
                {area}
              </button>
            ))}
          </div>
        </section>

        {/* Discover Recipes Results Grid */}
        <section style={{ margin: '3rem 0' }} aria-label="Discover Recipe Grid">
          <div className="section-header-editorial">
            <div>
              <h2 className="section-title-editorial font-serif">
                {debouncedQuery
                  ? `Search results for "${debouncedQuery}"`
                  : selectedCategory
                  ? `${selectedCategory} Dishes`
                  : selectedCuisine !== 'All'
                  ? `${selectedCuisine} Cuisine`
                  : 'Trending Recipes from TheMealDB'}
              </h2>
              <p className="section-subtitle-editorial">
                Click any dish to inspect the full ingredients checklist and step-by-step cooking guide.
              </p>
            </div>

            {meals.length > 0 && !isLoading && (
              <div style={{ padding: '0.4rem 0.9rem', backgroundColor: 'var(--bg-peach)', color: 'var(--primary-coral)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700 }}>
                {meals.length} recipes discovered
              </div>
            )}
          </div>

          {/* Inline Error Banner */}
          {error && (
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-white)',
                border: '1.5px solid var(--border-warm)',
                borderRadius: '24px',
                textAlign: 'center',
                margin: '2rem 0',
              }}
            >
              <AlertCircle size={32} color="var(--danger)" style={{ margin: '0 auto 0.75rem auto' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>{error}</p>
              <button
                className="btn-stash-primary"
                onClick={() => loadDiscoverMeals(debouncedQuery, selectedCategory, selectedCuisine)}
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Results Grid / Shimmer Skeleton */}
          {isLoading ? (
            <RecipeSkeletonGrid count={6} />
          ) : meals.length === 0 ? (
            <div className="empty-state-box" style={{ borderRadius: '32px' }}>
              <div className="empty-illustration">🍲</div>
              <h3 className="empty-title font-serif">No meals found</h3>
              <p className="empty-desc">
                Try another search keyword, choose a different world cuisine, or try our surprise random dish!
              </p>
              <button className="btn-stash-primary" onClick={handleSurpriseMe}>
                <Dices size={16} />
                <span>Surprise Me</span>
              </button>
            </div>
          ) : (
            <div className="stash-recipe-grid">
              {meals.map((m, idx) => (
                <RecipeCard
                  key={m.idMeal}
                  recipe={m}
                  onSelectRecipe={() => setSelectedMealId(m.idMeal)}
                  onStashRecipe={handleStashTheMealDBRecipe}
                  isStashed={stashedIds.has(m.idMeal)}
                  showStashButton={true}
                  imageLoading={idx < 3 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          )}
        </section>

        {/* Attribution */}
        <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border-warm)', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Recipe discovery data and imagery powered by{' '}
          <a
            href="https://www.themealdb.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary-coral)', fontWeight: 700 }}
          >
            TheMealDB
          </a>
          . All your saved stashes remain 100% private to your account.
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeSection="discover"
        onScrollToSection={(id) => {
          if (id === 'stash-section') navigate('/stash');
          else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenAddModal={() => navigate('/create-recipe')}
      />

      {/* Meal Detail Modal */}
      <MealDetailModal
        mealId={selectedMealId}
        isOpen={!!selectedMealId}
        onClose={() => setSelectedMealId(null)}
        isStashed={selectedMealId ? stashedIds.has(selectedMealId) : false}
        onStashMeal={handleStashTheMealDBRecipe}
        onShowToast={showToast}
      />

      {/* Custom Add Recipe Modal */}
      <EditorialAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => {}}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Discover;
