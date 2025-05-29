# movies/tmdb.py
import requests
from django.conf import settings

BASE_URL = "https://api.themoviedb.org/3"

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_TOKEN}"
}

def get_genre_names(genre_ids):
    url = f"{BASE_URL}/genre/movie/list"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        genres = {genre['id']: genre['name'] for genre in response.json()['genres']}
        return [genres.get(genre_id, "Unknown") for genre_id in genre_ids]
    return ["Unknown"]

def discover_movies(page=1):
    url = f"{BASE_URL}/discover/movie?page={page}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        movies = response.json()['results']
        for movie in movies:
            movie['genre_names'] = get_genre_names(movie.get('genre_ids', []))
        return movies
    return []

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None
