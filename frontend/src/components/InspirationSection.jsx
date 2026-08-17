import React from 'react';
import { Sparkles, Plus, Clock, ChefHat, ArrowUpRight } from 'lucide-react';
import { formatDomain, sanitizeUrl } from '../utils/urlHelper';

const INSPIRATION_RECIPES = [
  {
    title: 'Crispy Honey Garlic Butter Chicken Thighs',
    source_url: 'https://cooking.nytimes.com/recipes/honey-garlic-chicken',
    category: 'Dinner',
    time: '25 mins',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80',
    ingredients_list: '1.5 lbs Chicken thighs (skin-on)\n4 tbsp Unsalted butter\n5 cloves Minced garlic\n3 tbsp Raw honey\n2 tbsp Soy sauce\n1 tbsp Apple cider vinegar\nFresh parsley for garnish',
    notes: 'Sear chicken thighs skin-side down for 8 minutes until golden-crisp before basting with honey garlic glaze.',
  },
  {
    title: 'Creamy Sun-Dried Tomato & Basil Fettuccine',
    source_url: 'https://bonappetit.com/recipe/creamy-sun-dried-tomato-pasta',
    category: 'Dinner',
    time: '20 mins',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80',
    ingredients_list: '12 oz Fettuccine pasta\n1/2 cup Sun-dried tomatoes in oil\n1 cup Heavy cream\n4 cloves Minced garlic\n1/2 cup Grated Parmigiano-Reggiano\nHandful fresh basil leaves\nCracked black pepper',
    notes: 'Reserve 1/2 cup pasta cooking water to emulsify the parmesan sauce into a velvety silk texture.',
  },
  {
    title: 'Matcha Green Tea Japanese Cloud Cake',
    source_url: 'https://tiktok.com/@tokyobakes/matcha-cloud-cake',
    category: 'Dessert',
    time: '45 mins',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
    ingredients_list: '3 large Eggs, separated\n1/3 cup Granulated sugar\n2 tbsp Ceremonial-grade matcha powder\n1/2 cup Cake flour\n1 cup Heavy whipping cream\nFresh strawberries for topping',
    notes: 'Bake in a water bath at 300°F (150°C) for the most delicate melt-in-your-mouth cloud texture.',
  },
];

export const InspirationSection = ({ onSaveInspiration }) => {
  return (
    <section id="inspiration-section" style={{ margin: '4rem 0 3.5rem 0' }} aria-label="Inspiration for Tonight">
      <div className="section-header-editorial">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-coral)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            <Sparkles size={14} />
            <span>Curated Discoveries</span>
          </div>
          <h2 className="section-title-editorial font-serif">
            Inspiration for Tonight
          </h2>
          <p className="section-subtitle-editorial">
            Hand-picked dishes trending in the culinary community right now.
          </p>
        </div>
      </div>

      <div className="stash-recipe-grid">
        {INSPIRATION_RECIPES.map((recipe, index) => {
          const domain = formatDomain(recipe.source_url);
          return (
            <div key={index} className="editorial-card" style={{ border: '1.5px solid var(--border-warm)' }}>
              <div className="card-top-media">
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <span className="card-top-category">
                  {recipe.category}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.3rem 0.75rem',
                    backgroundColor: 'rgba(23, 33, 38, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Clock size={12} />
                  <span>{recipe.time}</span>
                </span>
              </div>

              <div className="card-details-body">
                <h3 className="card-recipe-title font-serif">
                  {recipe.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {recipe.notes}
                </p>
              </div>

              <div className="card-bottom-bar">
                <a
                  href={sanitizeUrl(recipe.source_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-source-domain"
                >
                  <ArrowUpRight size={14} color="var(--primary-coral)" />
                  <span>{domain}</span>
                </a>

                <button
                  className="btn-stash-peach"
                  onClick={() => onSaveInspiration(recipe)}
                  title="Add to your personal stash"
                >
                  <Plus size={14} strokeWidth={2.8} />
                  <span>+ Stash Recipe</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InspirationSection;
