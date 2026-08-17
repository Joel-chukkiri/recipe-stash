from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Recipe


class RecipeAPITests(APITestCase):
    def setUp(self):
        # Create User A
        self.user_a = User.objects.create_user(
            username='usera',
            email='usera@example.com',
            password='passwordA123!'
        )
        # Create User B
        self.user_b = User.objects.create_user(
            username='userb',
            email='userb@example.com',
            password='passwordB123!'
        )

        # Login tokens for User A
        login_url = reverse('auth_login')
        res_a = self.client.post(login_url, {'username': 'usera', 'password': 'passwordA123!'})
        self.token_a = res_a.data['access']

        # Login tokens for User B
        res_b = self.client.post(login_url, {'username': 'userb', 'password': 'passwordB123!'})
        self.token_b = res_b.data['access']

        # User A's initial recipe
        self.recipe_a = Recipe.objects.create(
            title='Creamy Garlic Tuscan Salmon',
            source_url='https://example.com/tuscan-salmon',
            ingredients_list='Salmon fillets\nHeavy cream\nGarlic\nSun-dried tomatoes\nSpinach',
            category='Dinner',
            is_favorite=True,
            owner=self.user_a
        )

    def test_unauthenticated_requests_denied(self):
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_a_can_list_their_own_recipes(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Creamy Garlic Tuscan Salmon')

    def test_user_b_cannot_see_user_a_recipes(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_b}')
        url = reverse('recipe-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_user_b_cannot_access_user_a_recipe_by_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_b}')
        url = reverse('recipe-detail', kwargs={'pk': self.recipe_a.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_b_cannot_edit_or_delete_user_a_recipe(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_b}')
        url = reverse('recipe-detail', kwargs={'pk': self.recipe_a.id})
        
        # Try PUT
        put_response = self.client.put(url, {
            'title': 'Hacked Recipe Title',
            'source_url': 'https://hacked.com',
            'ingredients_list': 'Nothing'
        })
        self.assertEqual(put_response.status_code, status.HTTP_404_NOT_FOUND)

        # Try DELETE
        del_response = self.client.delete(url)
        self.assertEqual(del_response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify recipe still exists intact
        self.recipe_a.refresh_from_db()
        self.assertEqual(self.recipe_a.title, 'Creamy Garlic Tuscan Salmon')

    def test_create_recipe_automatically_assigns_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        url = reverse('recipe-list')
        payload = {
            'title': 'Avocado Sourdough Toast',
            'source_url': 'https://instagram.com/p/testrecipe',
            'ingredients_list': 'Sourdough bread\nRipe avocado\nChili flakes\nSea salt\nOlive oil',
            'category': 'Breakfast'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Avocado Sourdough Toast')
        self.assertEqual(response.data['owner_username'], 'usera')
        
        created_recipe = Recipe.objects.get(id=response.data['id'])
        self.assertEqual(created_recipe.owner, self.user_a)

    def test_stash_themealdb_recipe_and_duplicate_prevention(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        url = reverse('recipe-list')
        payload = {
            'title': 'Teriyaki Chicken Casserole',
            'source_url': 'https://www.themealdb.com/meal/52772',
            'ingredients_list': 'Soy Sauce\nWater\nBrown Sugar\nGinger\nMinced Garlic\nCornstarch\nChicken Breasts',
            'category': 'Chicken',
            'area': 'Japanese',
            'image_url': 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
            'external_id': '52772',
            'source_type': 'themealdb'
        }
        # First stash
        res1 = self.client.post(url, payload)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['external_id'], '52772')
        self.assertEqual(res1.data['source_type'], 'themealdb')

        # Second stash attempt with same external_id -> returns 200 without duplicate row in DB
        res2 = self.client.post(url, payload)
        self.assertIn(res2.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(Recipe.objects.filter(owner=self.user_a, external_id='52772').count(), 1)

    def test_stashed_ids_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        Recipe.objects.create(
            title='Sample MealDB Recipe',
            source_url='',
            ingredients_list='Item 1',
            external_id='99999',
            source_type='themealdb',
            owner=self.user_a
        )
        url = reverse('recipe-stashed-ids')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('99999', response.data['stashed_ids'])

    def test_toggle_favorite_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        url = reverse('recipe-toggle-favorite', kwargs={'pk': self.recipe_a.id})
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_favorite'])
        
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertTrue(response2.data['is_favorite'])

    def test_search_and_filter_recipes(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_a}')
        Recipe.objects.create(
            title='Classic Margherita Pizza',
            source_url='https://allrecipes.com/pizza',
            ingredients_list='Pizza dough\nTomato sauce\nFresh mozzarella\nBasil',
            category='Dinner',
            owner=self.user_a
        )

        url = reverse('recipe-list')
        # Search by title
        res_salmon = self.client.get(f"{url}?search=Salmon")
        self.assertEqual(len(res_salmon.data), 1)
        self.assertEqual(res_salmon.data[0]['title'], 'Creamy Garlic Tuscan Salmon')

        # Search by ingredient
        res_basil = self.client.get(f"{url}?search=Basil")
        self.assertEqual(len(res_basil.data), 1)
        self.assertEqual(res_basil.data[0]['title'], 'Classic Margherita Pizza')
