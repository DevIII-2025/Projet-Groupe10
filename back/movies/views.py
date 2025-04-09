from rest_framework.decorators import api_view
from rest_framework.response import Response
from .tmdb import discover_movies, get_movie_details
from rest_framework import status
from .models import Movie, Review, List, MovieInList, Like, View
from .serializers import (
    MovieSerializer, ReviewSerializer, ListSerializer, ListDetailSerializer,
    MovieInListSerializer, LikeSerializer, ViewSerializer
)
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
import logging

logger = logging.getLogger(__name__)

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

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        movie = self.get_object()
        reviews = Review.objects.filter(movie=movie).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        movie = self.get_object()
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Vérifier si l'utilisateur a déjà commenté ce film
            existing_review = Review.objects.filter(user=request.user, movie=movie).first()
            if existing_review:
                return Response(
                    {'error': 'Vous avez déjà commenté ce film'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(user=request.user, movie=movie)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def update_review(self, request, pk=None):
        movie = self.get_object()
        try:
            review = Review.objects.get(user=request.user, movie=movie)
            serializer = ReviewSerializer(review, data=request.data, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Review.DoesNotExist:
            return Response(
                {'error': 'Commentaire non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'])
    def delete_review(self, request, pk=None):
        movie = self.get_object()
        try:
            review = Review.objects.get(user=request.user, movie=movie)
            review.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response(
                {'error': 'Commentaire non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        movie = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, movie=movie)
        
        if created:
            # Créer ou récupérer la liste "Favoris"
            favorites_list, _ = List.objects.get_or_create(
                name="Favoris",
                created_by=request.user,
                is_system=True,
                defaults={'description': 'Films que vous avez aimés'}
            )
            # Ajouter le film à la liste des favoris
            MovieInList.objects.get_or_create(
                movie=movie,
                list=favorites_list,
                defaults={'note': 'Ajouté aux favoris automatiquement'}
            )
            logger.info(f"User {request.user.username} liked movie {movie.id}")
            serializer = MovieSerializer(movie, context={'request': request})
            return Response({
                'status': 'liked',
                'movie': serializer.data
            })
        else:
            # Si on unlike, on retire aussi de la liste des favoris
            like.delete()
            try:
                favorites_list = List.objects.get(
                    name="Favoris",
                    created_by=request.user,
                    is_system=True
                )
                MovieInList.objects.filter(
                    movie=movie,
                    list=favorites_list
                ).delete()
            except List.DoesNotExist:
                pass
            logger.info(f"User {request.user.username} unliked movie {movie.id}")
            serializer = MovieSerializer(movie, context={'request': request})
            return Response({
                'status': 'unliked',
                'movie': serializer.data
            })

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        movie = self.get_object()
        view, created = View.objects.get_or_create(user=request.user, movie=movie)
        if created:
            # Créer ou mettre à jour la liste "Déjà vu"
            watched_list, _ = List.objects.get_or_create(
                name="Déjà vu",
                created_by=request.user,
                is_system=True,
                defaults={'description': 'Films que vous avez vus'}
            )
            MovieInList.objects.get_or_create(
                movie=movie,
                list=watched_list,
                defaults={'note': 'Marqué comme vu automatiquement'}
            )
            logger.info(f"User {request.user.username} marked movie {movie.id} as viewed")
        
        serializer = MovieSerializer(movie, context={'request': request})
        return Response({
            'status': 'viewed',
            'movie': serializer.data
        })

class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        logger.info(f"Fetching lists for user {self.request.user.username}")
        queryset = List.objects.filter(created_by=self.request.user).prefetch_related(
            'movies',
            'movieinlist_set',
            'movieinlist_set__movie'
        )
        logger.info(f"Found {queryset.count()} lists")
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ListDetailSerializer
        return ListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_movie(self, request, pk=None):
        list_obj = self.get_object()
        movie_id = request.data.get('movie_id')
        note = request.data.get('note', '')

        logger.info(f"Adding movie {movie_id} to list {list_obj.id} with note: {note}")

        if not movie_id:
            return Response(
                {'error': 'movie_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            movie = get_object_or_404(Movie, id=movie_id)
            movie_in_list, created = MovieInList.objects.get_or_create(
                movie=movie,
                list=list_obj,
                defaults={'note': note}
            )

            if not created:
                movie_in_list.note = note
                movie_in_list.save()

            logger.info(f"Successfully {'added' if created else 'updated'} movie in list")
            
            serializer = MovieInListSerializer(
                movie_in_list,
                context={'request': request}
            )
            return Response(serializer.data)
            
        except Movie.DoesNotExist:
            logger.error(f"Movie {movie_id} not found")
            return Response(
                {'error': 'Film non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error adding movie to list: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors de l\'ajout du film à la liste'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def remove_movie(self, request, pk=None):
        list_obj = self.get_object()
        movie_id = request.data.get('movie_id')

        if not movie_id:
            return Response(
                {'error': 'movie_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            movie_in_list = MovieInList.objects.get(
                movie_id=movie_id,
                list=list_obj
            )
            movie_in_list.delete()
            return Response({'status': 'success'})
        except MovieInList.DoesNotExist:
            return Response(
                {'error': 'Film non trouvé dans la liste'},
                status=status.HTTP_404_NOT_FOUND
            )
