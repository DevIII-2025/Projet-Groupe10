from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tmdb import get_popular_movies
from rest_framework import status
from .models import Movie, Review, FavoriteMovie, MovieList
from .serializers import MovieSerializer, ReviewSerializer, FavoriteMovieSerializer, MovieListSerializer

@api_view(['GET', 'POST'])
def movie_list(request):
    if request.method == 'GET':
        movies = Movie.objects.all()
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = MovieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def tmdb_popular_movies(request):
    movies = get_popular_movies()
    return Response(movies)