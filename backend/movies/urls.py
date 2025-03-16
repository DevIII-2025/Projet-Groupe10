from django.urls import path
from .views import movie_list, tmdb_popular_movies

urlpatterns = [
    path('movies/', movie_list),
    # path('reviews/', add_review),
    path('movies/popular/', tmdb_popular_movies),
]
