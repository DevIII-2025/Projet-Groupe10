from rest_framework import serializers
from .models import Movie, List, MovieInList, Like, View, Review, Report
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class MovieSerializer(serializers.ModelSerializer):
    is_liked = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_year', 'genre', 'poster_url', 
                 'created_at', 'updated_at', 'created_by', 'is_liked', 'is_viewed']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, movie=obj).exists()
        return False

    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return View.objects.filter(user=request.user, movie=obj).exists()
        return False

class MovieInListSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)
    added_at = serializers.DateTimeField(read_only=True)
    note = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = MovieInList
        fields = ['id', 'movie', 'added_at', 'note']
        read_only_fields = ['id', 'added_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['movie'] = MovieSerializer(
            instance.movie,
            context=self.context
        ).data
        return representation

class ListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    movies_count = serializers.SerializerMethodField()

    class Meta:
        model = List
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 
                 'created_by', 'is_public', 'is_system', 'movies_count']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_movies_count(self, obj):
        return obj.movies.count()

    def validate_name(self, value):
        user = self.context['request'].user
        qs = List.objects.filter(name=value, created_by=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Une liste avec ce nom existe déjà.")
        return value

class ListDetailSerializer(ListSerializer):
    movies = serializers.SerializerMethodField()

    class Meta:
        model = List
        fields = ListSerializer.Meta.fields + ['movies']

    def get_movies(self, obj):
        movies_in_list = obj.movieinlist_set.select_related('movie').all()
        return MovieInListSerializer(
            movies_in_list,
            many=True,
            context=self.context
        ).data

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    movie = MovieSerializer(read_only=True)
    is_reported = serializers.BooleanField(read_only=True)
    report_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'movie', 'rating', 'comment', 'created_at', 'is_reported', 'report_count']
        read_only_fields = ['created_at', 'is_reported', 'report_count']

class ReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'user', 'review', 'reason', 'description', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        report = Report.objects.create(**validated_data)
        review = report.review
        review.is_reported = True
        review.save()
        return report

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'movie', 'created_at']
        read_only_fields = ['created_at']

class ViewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = View
        fields = ['id', 'user', 'movie', 'viewed_at']
        read_only_fields = ['viewed_at']