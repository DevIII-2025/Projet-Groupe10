from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .tmdb import discover_movies, get_movie_details
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

@api_view(['GET', 'POST'])
def movie_lists(request):
    if request.method == 'GET':
        lists = MovieList.objects.all()
        serializer = MovieListSerializer(lists, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = MovieListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def movie_list_detail(request, list_id):
    try:
        movie_list = MovieList.objects.get(id=list_id)
    except MovieList.DoesNotExist:
        return Response({"error": "List not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MovieListSerializer(movie_list)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = MovieListSerializer(movie_list, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        movie_list.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST', 'DELETE'])
def movie_list_movies(request, list_id):
    try:
        movie_list = MovieList.objects.get(id=list_id)
    except MovieList.DoesNotExist:
        return Response({"error": "List not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        movie_id = request.data.get('movie_id')
        try:
            movie = Movie.objects.get(id=movie_id)
            movie_list.movies.add(movie)
            return Response(status=status.HTTP_201_CREATED)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        movie_id = request.data.get('movie_id')
        try:
            movie = Movie.objects.get(id=movie_id)
            movie_list.movies.remove(movie)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
