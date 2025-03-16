# movies/tmdb.py
import requests

API_KEY = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MDY0N2IzZWE0MmJiMTZmYzViMTQ4NjYxODkzMTE1NCIsIm5iZiI6MTc0MjA1NzE4Ny45MjUsInN1YiI6IjY3ZDVhZWUzNTc3NjY1YWNlNWYxNzQ5NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cflRKPnaInfrZsGErDd7iaQKTKPb_LwIrMBJWAKtcmM"
BASE_URL = "https://api.themoviedb.org/3"

headers = {
    "accept": "application/json",
    "Authorization": API_KEY
}

def get_popular_movies():
    url = f"{BASE_URL}/movie/popular"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()['results']
    return []
