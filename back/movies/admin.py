from django.contrib import admin
from .models import Movie, Review, List, MovieInList, Like, View

admin.site.register(Movie)
admin.site.register(Review)
admin.site.register(List)
admin.site.register(MovieInList)
admin.site.register(Like)
admin.site.register(View)

# from django.contrib import admin
# from .models import Movie

# class MovieAdmin(admin.ModelAdmin):
#     list_display = ('title', 'release_year', 'genre')
#     search_fields = ('title', 'genre')
#     list_filter = ('genre', 'release_year')

# admin.site.register(Movie, MovieAdmin)
