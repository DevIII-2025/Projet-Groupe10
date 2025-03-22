from django.contrib import admin
from .models import Movie, Review, MovieList, FavoriteMovie

admin.site.register(Movie)
admin.site.register(Review)
admin.site.register(MovieList)
admin.site.register(FavoriteMovie)

# from django.contrib import admin
# from .models import Movie

# class MovieAdmin(admin.ModelAdmin):
#     list_display = ('title', 'release_year', 'genre')
#     search_fields = ('title', 'genre')
#     list_filter = ('genre', 'release_year')

# admin.site.register(Movie, MovieAdmin)
