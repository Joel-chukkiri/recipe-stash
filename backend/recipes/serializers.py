from urllib.parse import urlparse
from rest_framework import serializers
from .models import Recipe


class RecipeSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    domain = serializers.SerializerMethodField()
    parsed_ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = (
            'id',
            'title',
            'source_url',
            'ingredients_list',
            'notes',
            'description',
            'instructions',
            'image_url',
            'category',
            'area',
            'external_id',
            'source_type',
            'is_favorite',
            'owner',
            'owner_username',
            'domain',
            'parsed_ingredients',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'domain', 'parsed_ingredients', 'created_at', 'updated_at')

    def get_domain(self, obj):
        if obj.source_type == 'themealdb':
            return 'themealdb.com'
        if not obj.source_url:
            return 'My Recipe'
        try:
            parsed = urlparse(obj.source_url)
            netloc = parsed.netloc or parsed.path
            return netloc.replace('www.', '').split('/')[0]
        except Exception:
            return 'website'

    def get_parsed_ingredients(self, obj):
        if not obj.ingredients_list:
            return []
        raw_lines = obj.ingredients_list.replace('\r\n', '\n').split('\n')
        items = []
        for line in raw_lines:
            line_str = line.strip()
            if line_str.startswith(('-', '•', '*', '▪')):
                line_str = line_str[1:].strip()
            if line_str:
                items.append(line_str)
        return items

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Recipe title cannot be blank.")
        return value.strip()

    def validate_source_url(self, value):
        if not value:
            return ''
        val = value.strip()
        if val and not val.startswith(('http://', 'https://')):
            val = 'https://' + val
        return val

    def validate_ingredients_list(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Ingredients list cannot be blank.")
        return value.strip()
