import axios from 'axios';

const MEAL_DB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

const mealClient = axios.create({
  baseURL: MEAL_DB_BASE_URL,
  timeout: 8000,
});

// Level 1: In-memory Map cache
const memoryCache = new Map();

// Helper to access sessionStorage safely
const readSessionStorage = (key) => {
  try {
    const raw = sessionStorage.getItem(`mealstash_cache_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    return null;
  }
};

const writeSessionStorage = (key, data) => {
  try {
    const entry = { data, timestamp: Date.now() };
    sessionStorage.setItem(`mealstash_cache_${key}`, JSON.stringify(entry));
  } catch (err) {
    // Ignore storage quota errors
  }
};

// Generic Cache Resolver with Stale-While-Revalidate
const resolveWithCache = async (cacheKey, fetchFn, signal) => {
  const now = Date.now();

  // Check memory cache first
  let cachedEntry = memoryCache.get(cacheKey);

  // If not in memory, check sessionStorage
  if (!cachedEntry) {
    const fromSession = readSessionStorage(cacheKey);
    if (fromSession) {
      cachedEntry = fromSession;
      memoryCache.set(cacheKey, fromSession);
    }
  }

  // If valid cache entry exists
  if (cachedEntry) {
    const isFresh = now - cachedEntry.timestamp < CACHE_TTL_MS;
    if (isFresh) {
      return cachedEntry.data;
    }

    // Stale: trigger background revalidation without blocking caller
    fetchFn(signal)
      .then((freshData) => {
        if (freshData && Array.isArray(freshData) && freshData.length > 0) {
          const newEntry = { data: freshData, timestamp: Date.now() };
          memoryCache.set(cacheKey, newEntry);
          writeSessionStorage(cacheKey, freshData);
        }
      })
      .catch(() => {
        // Background refresh failure can silently retain stale cache
      });

    return cachedEntry.data;
  }

  // Not in cache: perform fetch
  const freshData = await fetchFn(signal);
  if (freshData) {
    const newEntry = { data: freshData, timestamp: Date.now() };
    memoryCache.set(cacheKey, newEntry);
    writeSessionStorage(cacheKey, freshData);
  }
  return freshData;
};

export const mealApi = {
  /**
   * Synchronously read cached data if available (for 0ms instant initial render)
   */
  getCachedMealsSync: (cacheKey = 'explore_default') => {
    const mem = memoryCache.get(cacheKey);
    if (mem && mem.data) return mem.data;
    const sess = readSessionStorage(cacheKey);
    if (sess && sess.data) {
      memoryCache.set(cacheKey, sess);
      return sess.data;
    }
    return null;
  },

  /**
   * Check if valid unexpired cache exists for key
   */
  hasValidCache: (cacheKey = 'explore_default') => {
    const now = Date.now();
    const mem = memoryCache.get(cacheKey);
    if (mem && now - mem.timestamp < CACHE_TTL_MS) return true;
    const sess = readSessionStorage(cacheKey);
    if (sess && now - sess.timestamp < CACHE_TTL_MS) {
      memoryCache.set(cacheKey, sess);
      return true;
    }
    return false;
  },

  /**
   * Search meals by name / keyword with AbortController signal support
   */
  searchMeals: async (query = '', signal = null) => {
    const trimmed = query.trim().toLowerCase();
    const cacheKey = trimmed ? `search_${trimmed}` : 'explore_default';

    return resolveWithCache(
      cacheKey,
      async (sig) => {
        const response = await mealClient.get('/search.php', {
          params: { s: trimmed },
          signal: sig,
        });
        return response.data?.meals || [];
      },
      signal
    );
  },

  /**
   * Filter meals by category name (efficient single-endpoint summary)
   */
  getMealsByCategory: async (category, signal = null) => {
    if (!category || category === 'All') {
      return mealApi.searchMeals('', signal);
    }
    const catClean = category.trim().toLowerCase();
    const cacheKey = `category_${catClean}`;

    return resolveWithCache(
      cacheKey,
      async (sig) => {
        const response = await mealClient.get('/filter.php', {
          params: { c: category },
          signal: sig,
        });
        const meals = response.data?.meals || [];
        // Attach category property directly so cards display it without N+1 requests
        return meals.map((m) => ({
          ...m,
          strCategory: category,
        }));
      },
      signal
    );
  },

  /**
   * Filter meals by world cuisine / area (efficient single-endpoint summary)
   */
  getMealsByArea: async (area, signal = null) => {
    if (!area || area === 'All') {
      return mealApi.searchMeals('', signal);
    }
    const areaClean = area.trim().toLowerCase();
    const cacheKey = `area_${areaClean}`;

    return resolveWithCache(
      cacheKey,
      async (sig) => {
        const response = await mealClient.get('/filter.php', {
          params: { a: area },
          signal: sig,
        });
        const meals = response.data?.meals || [];
        // Attach area property directly so cards display it without N+1 requests
        return meals.map((m) => ({
          ...m,
          strArea: area,
        }));
      },
      signal
    );
  },

  /**
   * Look up meal full details by ID (only invoked when opening modal or saving)
   */
  getMealById: async (mealId) => {
    if (!mealId) return null;
    const cacheKey = `meal_id_${mealId}`;

    return resolveWithCache(
      cacheKey,
      async () => {
        const response = await mealClient.get('/lookup.php', {
          params: { i: mealId },
        });
        const meals = response.data?.meals;
        return meals && meals.length > 0 ? meals[0] : null;
      }
    );
  },

  /**
   * Get a single random surprise meal (uncached for dynamic exploration)
   */
  getRandomMeal: async () => {
    const response = await mealClient.get('/random.php');
    const meals = response.data?.meals;
    return meals && meals.length > 0 ? meals[0] : null;
  },

  /**
   * Parse ingredients from TheMealDB object
   */
  parseMealIngredients: (meal) => {
    if (!meal) return [];
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim().length > 0) {
        list.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : '',
        });
      }
    }
    return list;
  },

  /**
   * Format ingredients for text storage
   */
  formatIngredientsForStorage: (ingredientsList) => {
    return ingredientsList
      .map((item) => (item.measure ? `${item.measure} ${item.ingredient}` : item.ingredient))
      .join('\n');
  },
};

export default mealApi;
