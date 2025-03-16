from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tmdb import discover_movies, get_movie_details
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
    movies = discover_movies(page=1)
    return Response(movies)

@api_view(['GET'])
def movie_details(request, movie_id):
    movie = get_movie_details(movie_id)
    if movie:
        return Response(movie)
    return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
