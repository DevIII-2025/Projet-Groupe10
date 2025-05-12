from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    release_year = models.IntegerField()
    genre = models.CharField(max_length=100)
    poster_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='movies_created')
    likes = models.ManyToManyField(User, through='Like', related_name='liked_movies')
    views = models.ManyToManyField(User, through='View', related_name='viewed_movies')

    def __str__(self):
        return f"{self.title} ({self.release_year})"

    class Meta:
        ordering = ['-created_at']

class List(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lists')
    is_public = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)  # Pour les listes système comme "Déjà vu"
    movies = models.ManyToManyField(Movie, through='MovieInList', related_name='user_lists')

    def __str__(self):
        return f"{self.name} (par {self.created_by.username})"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['name', 'created_by']

class MovieInList(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)  # Pour des notes personnelles sur le film dans la liste

    class Meta:
        unique_together = ['movie', 'list']
        ordering = ['-added_at']

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'movie']
        ordering = ['-created_at']

class View(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'movie']
        ordering = ['-viewed_at']

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # Note sur 5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    is_reported = models.BooleanField(default=False)

    def __str__(self):
        return f"Review by {self.user.username} on {self.movie.title}"

class Report(models.Model):
    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('inappropriate', 'Contenu inapproprié'),
        ('hate_speech', 'Discours haineux'),
        ('other', 'Autre')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="reports")
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'review']
        ordering = ['-created_at']

    def __str__(self):
        return f"Report by {self.user.username} on review {self.review.id}"

