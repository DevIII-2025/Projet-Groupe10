from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'movies', views.MovieViewSet, basename='movie')
router.register(r'lists', views.ListViewSet, basename='list')

urlpatterns = [
    path('', include(router.urls)),
]
