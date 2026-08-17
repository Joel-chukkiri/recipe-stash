from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


class AccountsAuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('auth_me')

        self.user_data = {
            'username': 'chefalice',
            'email': 'alice@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }

    def test_register_user_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'chefalice')
        self.assertTrue(User.objects.filter(username='chefalice').exists())

    def test_register_duplicate_username_fails(self):
        self.client.post(self.register_url, self.user_data)
        dup_data = self.user_data.copy()
        response = self.client.post(self.register_url, dup_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_jwt_tokens_and_user_info(self):
        # Register user
        self.client.post(self.register_url, self.user_data)

        # Login
        response = self.client.post(self.login_url, {
            'username': 'chefalice',
            'password': 'StrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'chefalice')

    def test_protected_profile_endpoint(self):
        # Register & Login
        self.client.post(self.register_url, self.user_data)
        login_res = self.client.post(self.login_url, {
            'username': 'chefalice',
            'password': 'StrongPassword123!'
        })
        access_token = login_res.data['access']

        # Request profile unauthenticated -> 401
        res_unauth = self.client.get(self.profile_url)
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Request profile authenticated -> 200
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        res_auth = self.client.get(self.profile_url)
        self.assertEqual(res_auth.status_code, status.HTTP_200_OK)
        self.assertEqual(res_auth.data['username'], 'chefalice')
