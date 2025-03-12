from django.urls import path
from .views import movie_list

urlpatterns = [
    path('movies/', movie_list),
    # path('reviews/', add_review),
]
