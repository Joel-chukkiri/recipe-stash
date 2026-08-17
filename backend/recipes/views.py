from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Recipe
from .serializers import RecipeSerializer


class RecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Recipe.objects.filter(owner=user)

        # Search parameter across title, ingredients, area, and notes
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(ingredients_list__icontains=search_query) |
                Q(notes__icontains=search_query) |
                Q(instructions__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(area__icontains=search_query)
            )

        # Filter by category
        category = self.request.query_params.get('category', '').strip()
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__iexact=category)

        # Filter by source_type (custom vs themealdb)
        source_type = self.request.query_params.get('source_type', '').strip()
        if source_type and source_type.lower() != 'all':
            queryset = queryset.filter(source_type__iexact=source_type)

        # Filter by area / cuisine
        area = self.request.query_params.get('area', '').strip()
        if area and area.lower() != 'all':
            queryset = queryset.filter(area__iexact=area)

        # Filter by favorite
        favorite = self.request.query_params.get('favorite', '').strip().lower()
        if favorite == 'true':
            queryset = queryset.filter(is_favorite=True)

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at').strip()
        allowed_orderings = ['-created_at', 'created_at', 'title', '-title']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)

        return queryset

    def create(self, request, *args, **kwargs):
        user = self.request.user
        external_id = request.data.get('external_id')

        # Prevent duplicate stashing for the same user
        if external_id:
            existing = Recipe.objects.filter(owner=user, external_id=external_id).first()
            if existing:
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(owner=user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], url_path='toggle-favorite')
    def toggle_favorite(self, request, pk=None):
        recipe = self.get_object()
        recipe.is_favorite = not recipe.is_favorite
        recipe.save()
        serializer = self.get_serializer(recipe)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='stashed-ids')
    def stashed_ids(self, request):
        user = self.request.user
        ids = list(Recipe.objects.filter(owner=user, external_id__isnull=False).values_list('external_id', flat=True))
        return Response({'stashed_ids': ids})

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        user = self.request.user
        recipes = Recipe.objects.filter(owner=user)
        total = recipes.count()
        favorites = recipes.filter(is_favorite=True).count()
        custom_count = recipes.filter(source_type='custom').count()
        themealdb_count = recipes.filter(source_type='themealdb').count()

        now = timezone.now()
        this_month = recipes.filter(
            created_at__year=now.year,
            created_at__month=now.month
        ).count()

        categories = set(recipes.values_list('category', flat=True))

        all_ingredients = []
        for r in recipes:
            for item in r.ingredients_list.split('\n'):
                cleaned = item.strip().strip('-•*').strip()
                if cleaned and len(cleaned) < 30:
                    all_ingredients.append(cleaned)
        unique_ingredients_count = len(set(all_ingredients))

        return Response({
            'total_recipes': total,
            'favorite_recipes': favorites,
            'custom_recipes': custom_count,
            'themealdb_recipes': themealdb_count,
            'this_month': this_month,
            'categories_count': len(categories),
            'unique_ingredients_count': unique_ingredients_count,
        })
