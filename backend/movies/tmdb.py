# movies/tmdb.py
import requests
from django.conf import settings

api_key = settings.TMDB_API_KEY
BASE_URL = "https://api.themoviedb.org/3"

headers = {
    "accept": "application/json",
    "Authorization": api_key
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
