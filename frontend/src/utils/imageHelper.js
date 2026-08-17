// Intelligent food image matcher using high quality food photography
// Matches keywords from title and category to appropriate food imagery

const FOOD_IMAGE_MAP = [
  {
    keywords: ['salmon', 'trout', 'fish', 'seafood', 'shrimp', 'prawn', 'tuna', 'cod', 'lobster'],
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['pasta', 'spaghetti', 'fettuccine', 'penne', 'lasagna', 'carbonara', 'bolognese', 'ravioli', 'noodles', 'ramen', 'macaroni'],
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['pizza', 'flatbread', 'calzone', 'margherita'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['burger', 'cheeseburger', 'sandwich', 'wrap', 'panini', 'toast', 'avocado toast'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['salad', 'caesar', 'greens', 'kale', 'quinoa bowl', 'poke', 'bowl'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['curry', 'tikka', 'masala', 'butter chicken', 'biryani', 'dal', 'naan', 'thai curry'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['soup', 'stew', 'chowder', 'chili', 'broth', 'gumbo'],
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['pancake', 'waffle', 'french toast', 'crepe', 'egg', 'omelette', 'benedict', 'breakfast', 'oats', 'granola', 'smoothie'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['taco', 'burrito', 'fajita', 'quesadilla', 'enchilada', 'mexican', 'salsa', 'nachos'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['cake', 'cookie', 'brownie', 'dessert', 'pie', 'chocolate', 'cheesecake', 'cupcake', 'ice cream', 'muffin', 'pastry'],
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['steak', 'beef', 'ribeye', 'roast', 'brisket', 'pork', 'ribs', 'meat'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['chicken', 'wings', 'thighs', 'poultry', 'fried chicken', 'roast chicken'],
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['drink', 'cocktail', 'mocktail', 'latte', 'coffee', 'tea', 'lemonade', 'juice', 'matcha'],
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
];

const CATEGORY_DEFAULT_IMAGES = {
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
  Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  Dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  Dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
  Snack: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
  Drink: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  Baking: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
};

export const getRecipeImage = (title = '', category = 'Dinner') => {
  const normalizedTitle = title.toLowerCase();

  for (const item of FOOD_IMAGE_MAP) {
    if (item.keywords.some(keyword => normalizedTitle.includes(keyword))) {
      return item.url;
    }
  }

  // Fallback to category default
  return CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.Dinner;
};
