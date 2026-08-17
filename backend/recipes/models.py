from django.db import models
from django.contrib.auth.models import User


class Recipe(models.Model):
    CATEGORY_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch', 'Lunch'),
        ('Dinner', 'Dinner'),
        ('Dessert', 'Dessert'),
        ('Snack', 'Snack'),
        ('Drink', 'Drink'),
        ('Baking', 'Baking'),
        ('Side', 'Side'),
        ('Starter', 'Starter'),
        ('Vegetarian', 'Vegetarian'),
        ('Pasta', 'Pasta'),
        ('Seafood', 'Seafood'),
        ('Chicken', 'Chicken'),
        ('Beef', 'Beef'),
        ('Other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    source_url = models.URLField(max_length=1000, blank=True, default='')
    ingredients_list = models.TextField(
        help_text="Ingredients entered as a list or newline-separated items."
    )
    notes = models.TextField(blank=True, default='', help_text="Optional cooking notes or tips.")
    description = models.TextField(blank=True, default='')
    instructions = models.TextField(blank=True, default='', help_text="Step-by-step preparation instructions.")
    image_url = models.URLField(max_length=1000, blank=True, default='', help_text="Direct image URL if available.")
    category = models.CharField(max_length=50, default='Dinner', blank=True)
    area = models.CharField(max_length=100, blank=True, default='', help_text="Cuisine / country origin, e.g. Italian, Mexican.")
    
    external_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default=None,
        db_index=True,
        help_text="External recipe ID (e.g. TheMealDB meal id) to prevent duplicate stashes."
    )
    source_type = models.CharField(
        max_length=50,
        default='custom',
        help_text="'custom' for user-created recipes, 'themealdb' for recipes stashed from TheMealDB."
    )
    
    is_favorite = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'external_id'],
                condition=models.Q(external_id__isnull=False),
                name='unique_owner_external_id'
            )
        ]

    def __str__(self):
        return f"{self.title} ({self.source_type} - {self.owner.username})"
