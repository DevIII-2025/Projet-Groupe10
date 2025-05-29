from django.core.management.base import BaseCommand
from movies.tmdb import discover_movies
from movies.models import Movie

class Command(BaseCommand):
    help = "Importer environ 100 films diversifiés depuis TMDB"

    def handle(self, *args, **options):
        total_imported = 0
        pages_needed = 5  # 5 pages x 20 films par page = 100 films

        for page in range(1, pages_needed + 1):
            movies = discover_movies(page=page)
            for movie_data in movies:
                # Join genre names with commas
                genres = ", ".join(movie_data.get('genre_names', ["Inconnu"]))
                
                Movie.objects.update_or_create(
                    title=movie_data['title'],
                    defaults={
                        'description': movie_data['overview'] or "Pas de description",
                        'release_year': movie_data['release_date'][:4] if movie_data['release_date'] else 0,
                        'genre': genres,
                        'poster_url': f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}" if movie_data['poster_path'] else ""
                    }
                )
                total_imported += 1

        self.stdout.write(self.style.SUCCESS(f"{total_imported} films importés avec succès !"))
