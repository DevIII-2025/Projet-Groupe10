from rest_framework import serializers
from .models import Movie, Review, FavoriteMovie, MovieList

class MovieSerializer(serializers.ModelSerializer):
    reviews = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class FavoriteMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteMovie
        fields = '__all__'

class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieList
        fields = '__all__'
