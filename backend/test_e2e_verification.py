import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from recipes.models import Recipe


def run_full_verification():
    print("=" * 65)
    print("RECIPE STASH FINAL PRODUCT — COMPLETE E2E & THEMEALDB SUITE")
    print("=" * 65)

    client = APIClient()

    # Step 1: Register User 1 (Alice)
    print("\n[1] Testing User Registration...")
    reg_data = {
        'username': 'alice_chef',
        'email': 'alice@recipestash.app',
        'password': 'PasswordAlice123!',
        'password_confirm': 'PasswordAlice123!'
    }
    User.objects.filter(username__in=['alice_chef', 'bob_chef']).delete()

    res = client.post('/api/auth/register/', reg_data, format='json')
    assert res.status_code == 201, f"Registration failed: {res.data}"
    print("  -> User 'alice_chef' registered successfully.")

    # Step 2: Login User 1
    print("\n[2] Testing JWT Login...")
    login_data = {'username': 'alice_chef', 'password': 'PasswordAlice123!'}
    res = client.post('/api/auth/login/', login_data, format='json')
    assert res.status_code == 200, f"Login failed: {res.data}"
    assert 'access' in res.data and 'refresh' in res.data, "Missing JWT tokens"
    alice_token = res.data['access']
    alice_refresh = res.data['refresh']
    print(f"  -> Tokens received! Access token length: {len(alice_token)}")

    # Step 3: Refresh Token
    print("\n[3] Testing JWT Refresh Token endpoint...")
    res = client.post('/api/auth/refresh/', {'refresh': alice_refresh}, format='json')
    assert res.status_code == 200, f"Token refresh failed: {res.data}"
    assert 'access' in res.data, "No new access token returned"
    print("  -> Token successfully refreshed.")

    # Step 4: Access Protected Profile
    print("\n[4] Testing Protected Profile API (/api/auth/me/)...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {alice_token}')
    res = client.get('/api/auth/me/')
    assert res.status_code == 200, f"Profile request failed: {res.data}"
    assert res.data['username'] == 'alice_chef'
    print(f"  -> Successfully fetched profile for '{res.data['username']}'")

    # Step 5: Create Custom Recipe
    print("\n[5] Testing Custom Recipe Creation (source_type='custom')...")
    custom_recipe_payload = {
        'title': 'Grandma Rose Secret Apple Pie',
        'source_url': 'https://familyrecipes.com/apple-pie',
        'category': 'Dessert',
        'ingredients_list': '6 Honeycrisp apples\n1 cup Sugar\n2 tbsp Cinnamon\n2 Pie crusts',
        'notes': 'Bake at 375°F for 45 minutes.',
        'source_type': 'custom'
    }
    res = client.post('/api/recipes/', custom_recipe_payload, format='json')
    assert res.status_code == 201, f"Recipe creation failed: {res.data}"
    custom_id = res.data['id']
    assert res.data['source_type'] == 'custom'
    print(f"  -> Custom Recipe #{custom_id} ('{res.data['title']}') created.")

    # Step 6: Stash TheMealDB Recipe
    print("\n[6] Testing Stashing TheMealDB Recipe (source_type='themealdb', external_id='52772')...")
    themealdb_payload = {
        'title': 'Teriyaki Chicken Casserole',
        'source_url': 'https://www.themealdb.com/meal/52772',
        'category': 'Chicken',
        'area': 'Japanese',
        'image_url': 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
        'ingredients_list': 'Soy Sauce\nWater\nBrown Sugar\nGinger\nMinced Garlic\nCornstarch\nChicken Breasts',
        'instructions': 'Preheat oven to 350° F. In a small saucepan, mix soy sauce, water, brown sugar, ginger and garlic.',
        'external_id': '52772',
        'source_type': 'themealdb',
        'is_favorite': True
    }
    res_meal = client.post('/api/recipes/', themealdb_payload, format='json')
    assert res_meal.status_code == 201
    meal_id = res_meal.data['id']
    assert res_meal.data['external_id'] == '52772'
    assert res_meal.data['source_type'] == 'themealdb'
    assert res_meal.data['domain'] == 'themealdb.com'
    print(f"  -> TheMealDB Recipe #{meal_id} ('{res_meal.data['title']}') stashed successfully.")

    # Step 7: Test Duplicate Stashing Prevention
    print("\n[7] Testing Duplicate Stashing Prevention for external_id='52772'...")
    res_dup = client.post('/api/recipes/', themealdb_payload, format='json')
    assert res_dup.status_code in [200, 201], f"Duplicate stashing threw error: {res_dup.status_code}"
    # Verify exactly 1 recipe in DB with external_id 52772 for alice
    assert Recipe.objects.filter(owner__username='alice_chef', external_id='52772').count() == 1
    print("  -> Duplicate stashing prevented cleanly without duplicate rows.")

    # Step 8: Test stashed-ids lookup endpoint
    print("\n[8] Testing /api/recipes/stashed-ids/ endpoint...")
    res_stashed_ids = client.get('/api/recipes/stashed-ids/')
    assert res_stashed_ids.status_code == 200
    assert '52772' in res_stashed_ids.data['stashed_ids']
    print(f"  -> Stashed IDs: {res_stashed_ids.data['stashed_ids']}")

    # Step 9: Test Stats Endpoint
    print("\n[9] Testing /api/recipes/stats/ endpoint...")
    stats_res = client.get('/api/recipes/stats/')
    assert stats_res.status_code == 200
    assert stats_res.data['total_recipes'] == 2
    assert stats_res.data['custom_recipes'] == 1
    assert stats_res.data['themealdb_recipes'] == 1
    print(f"  -> Stats: Total={stats_res.data['total_recipes']}, Custom={stats_res.data['custom_recipes']}, TheMealDB={stats_res.data['themealdb_recipes']}")

    # Step 10: Test User Isolation (Bob)
    print("\n[10] Testing Strict User Isolation (Registering bob_chef)...")
    client.credentials()  # Clear credentials
    client.post('/api/auth/register/', {
        'username': 'bob_chef',
        'email': 'bob@recipestash.app',
        'password': 'PasswordBob123!',
        'password_confirm': 'PasswordBob123!'
    }, format='json')

    login_b = client.post('/api/auth/login/', {'username': 'bob_chef', 'password': 'PasswordBob123!'}, format='json')
    bob_token = login_b.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {bob_token}')

    bob_recipes = client.get('/api/recipes/')
    assert bob_recipes.status_code == 200
    assert len(bob_recipes.data) == 0, f"SECURITY BREACH: Bob saw Alice's recipes: {bob_recipes.data}"
    print("  -> User isolation verified: bob_chef stash is completely empty (0 recipes).")

    # Bob direct access attack on Alice's recipes
    direct_get = client.get(f'/api/recipes/{meal_id}/')
    assert direct_get.status_code == 404, "SECURITY BREACH: Bob accessed Alice's recipe"
    print("  -> GET /api/recipes/<alice_id>/ returns 404 Not Found as expected.")

    print("\n" + "=" * 65)
    print("ALL 10 E2E INTEGRATION, THEMEALDB, & SECURITY TESTS PASSED!")
    print("=" * 65)


if __name__ == '__main__':
    run_full_verification()
