# movies/tmdb.py
import requests
from django.conf import settings

BASE_URL = "https://api.themoviedb.org/3"

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_KEY}"
}

def discover_movies(page=1):
    url = f"{BASE_URL}/discover/movie?page={page}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()['results']
    return []

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None
