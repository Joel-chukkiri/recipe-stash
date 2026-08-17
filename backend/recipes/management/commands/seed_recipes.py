from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from recipes.models import Recipe


class Command(BaseCommand):
    help = 'Seeds sample recipes and a demo user for Recipe Stash'

    def handle(self, *args, **options):
        # Create or retrieve demo user
        user, created = User.objects.get_or_create(
            username='chef_julia',
            defaults={
                'email': 'julia@recipestash.app',
                'first_name': 'Julia',
                'last_name': 'Childs'
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo user: chef_julia / password123"))
        else:
            self.stdout.write(self.style.WARNING(f"Demo user chef_julia already exists."))

        sample_recipes = [
            {
                'title': 'Creamy Tuscan Garlic Salmon',
                'source_url': 'https://www.allrecipes.com/recipe/creamy-tuscan-salmon',
                'category': 'Dinner',
                'is_favorite': True,
                'ingredients_list': (
                    "2 large Salmon fillets\n"
                    "2 tbsp Olive oil\n"
                    "1 tbsp Butter\n"
                    "6 cloves Garlic, minced\n"
                    "1 small Yellow onion, diced\n"
                    "1/2 cup Vegetable or fish broth\n"
                    "1/2 cup Sun-dried tomatoes in oil, drained\n"
                    "1 3/4 cups Heavy cream\n"
                    "3 cups Fresh baby spinach\n"
                    "1/2 cup Grated parmesan cheese\n"
                    "1 tbsp Fresh chopped parsley"
                ),
                'notes': "Sear salmon skin-side down first for 5 minutes. Remove salmon before making sauce, then gently re-add."
            },
            {
                'title': 'Crispy Sourdough Avocado Toast with Poached Egg',
                'source_url': 'https://instagram.com/p/brunchmasterpiece',
                'category': 'Breakfast',
                'is_favorite': True,
                'ingredients_list': (
                    "2 slices Artisan sourdough bread\n"
                    "1 ripe Hass avocado\n"
                    "2 fresh Eggs\n"
                    "1 tbsp White vinegar (for poaching)\n"
                    "1/2 Lemon, juiced\n"
                    "1/4 tsp Red chili flakes\n"
                    "Flaky Maldon sea salt\n"
                    "Extra virgin olive oil for drizzling"
                ),
                'notes': "Swirl simmering water into a vortex before gently dropping the eggs in for 3 minutes."
            },
            {
                'title': 'Classic Neapolitan Margherita Pizza',
                'source_url': 'https://cooking.nytimes.com/recipes/margherita-pizza',
                'category': 'Dinner',
                'is_favorite': True,
                'ingredients_list': (
                    "1 ball Neapolitan pizza dough (250g)\n"
                    "1/2 cup San Marzano canned crushed tomatoes\n"
                    "100g Fresh mozzarella di bufala, torn\n"
                    "6 Fresh basil leaves\n"
                    "1 tbsp Extra virgin olive oil\n"
                    "Pinch of fine sea salt"
                ),
                'notes': "Preheat pizza stone or steel at 500°F (or 260°C) for at least 45 minutes."
            },
            {
                'title': 'Fluffy Japanese Souffle Pancakes',
                'source_url': 'https://tiktok.com/@tokyosweets/souffle-pancakes',
                'category': 'Breakfast',
                'is_favorite': False,
                'ingredients_list': (
                    "2 Egg yolks\n"
                    "1 tbsp Whole milk\n"
                    "1/2 tsp Pure vanilla extract\n"
                    "4 tbsp Cake flour\n"
                    "1/2 tsp Baking powder\n"
                    "3 Egg whites\n"
                    "2 tbsp Granulated sugar\n"
                    "Powdered sugar & maple syrup for serving"
                ),
                'notes': "Whip egg whites to stiff peaks. Cook on lowest possible heat covered with a splash of water for steam."
            },
            {
                'title': 'Decadent Salted Caramel Fudgy Brownies',
                'source_url': 'https://sallysbakingaddiction.com/salted-caramel-brownies',
                'category': 'Dessert',
                'is_favorite': True,
                'ingredients_list': (
                    "1/2 cup Unsalted butter, melted\n"
                    "1 cup Granulated sugar\n"
                    "2 large Eggs at room temperature\n"
                    "1 tsp Pure vanilla extract\n"
                    "1/3 cup Dutch-processed cocoa powder\n"
                    "1/2 cup All-purpose flour\n"
                    "1/4 tsp Salt\n"
                    "1/2 cup Salted caramel sauce for swirling\n"
                    "1/2 cup Dark chocolate chunks"
                ),
                'notes': "Do not overbake! A toothpick inserted in the center should come out with moist crumbs."
            },
            {
                'title': 'Smash Double Cheeseburger with Secret Sauce',
                'source_url': 'https://seriouseats.com/ultra-smashed-cheeseburger-recipe',
                'category': 'Lunch',
                'is_favorite': False,
                'ingredients_list': (
                    "8 oz Ground beef (80/20 chuck blend)\n"
                    "2 Potato burger buns, toasted with butter\n"
                    "4 slices American cheese\n"
                    "2 tbsp Mayonnaise\n"
                    "1 tbsp Ketchup\n"
                    "1 tsp Yellow mustard\n"
                    "1 tbsp Finely minced dill pickles\n"
                    "Kosher salt and black pepper"
                ),
                'notes': "Get the cast iron screaming hot. Smash as thin as possible in the first 30 seconds."
            },
            {
                'title': 'Authentic Creamy Chicken Tikka Masala',
                'source_url': 'https://bonappetit.com/recipe/chicken-tikka-masala',
                'category': 'Dinner',
                'is_favorite': True,
                'ingredients_list': (
                    "1.5 lbs Boneless skinless chicken thighs, cubed\n"
                    "1 cup Plain whole-milk Greek yogurt\n"
                    "2 tbsp Garam masala\n"
                    "1 tbsp Ground turmeric\n"
                    "1 tbsp Ground cumin\n"
                    "6 cloves Minced garlic\n"
                    "2 tbsp Grated fresh ginger\n"
                    "1 can (14 oz) Tomato puree\n"
                    "1 cup Heavy cream\n"
                    "Fresh cilantro & basmati rice for serving"
                ),
                'notes': "Marinate chicken for at least 4 hours. Broil on high heat before simmering in sauce."
            },
            {
                'title': 'Iced Brown Sugar Oat Milk Shaken Espresso',
                'source_url': 'https://food52.com/recipes/shaken-espresso',
                'category': 'Drink',
                'is_favorite': False,
                'ingredients_list': (
                    "2 shots Blonde espresso (hot)\n"
                    "1.5 tbsp Dark brown sugar\n"
                    "1/4 tsp Ground cinnamon\n"
                    "1 cup Ice cubes\n"
                    "3/4 cup Barista-blend oat milk"
                ),
                'notes': "Shake espresso, sugar, cinnamon, and ice vigorously in a cocktail shaker for 15 seconds until frothy."
            }
        ]

        for item in sample_recipes:
            recipe, created_r = Recipe.objects.get_or_create(
                owner=user,
                title=item['title'],
                defaults=item
            )
            if created_r:
                self.stdout.write(self.style.SUCCESS(f"Added recipe: {recipe.title}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded sample recipes!"))
