from django.urls import path
from . import views

urlpatterns = [
    path('movies/', views.movie_list, name='movie-list'),
    # path('reviews/', add_review),
    path('movies/tmdb/popular/', views.tmdb_popular_movies, name='tmdb-popular-movies'),
    path('movies/tmdb/<int:movie_id>/', views.movie_details, name='movie-details'),
    path('lists/', views.movie_lists, name='movie-lists'),
    path('lists/<int:list_id>/', views.movie_list_detail, name='movie-list-detail'),
    path('lists/<int:list_id>/movies/', views.movie_list_movies, name='movie-list-movies'),
]
