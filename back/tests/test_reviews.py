from django.test import TestCase
from django.contrib.auth.models import User
from movies.models import Movie, Review, Report

class ReviewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.admin = User.objects.create_superuser(username='admin', password='adminpass', email='admin@test.com')
        self.movie = Movie.objects.create(
            title='Test Movie',
            description='Description',
            release_year=2024,
            genre='Action',
            poster_url='http://example.com/poster.jpg',
            created_by=self.user
        )

    def test_add_review(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.post(f'/movies/{self.movie.id}/add_review/', {
            'rating': 5,
            'comment': 'Super film !'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Review.objects.count(), 1)

    def test_report_review_and_auto_delete(self):
        self.client.login(username='testuser', password='testpass')
        # Créer un commentaire
        review = Review.objects.create(user=self.user, movie=self.movie, rating=4, comment='À signaler')
        # Créer 9 autres utilisateurs pour signaler
        for i in range(9):
            user = User.objects.create_user(username=f'user{i}', password='pass')
            self.client.login(username=f'user{i}', password='pass')
            response = self.client.post(f'/movies/{self.movie.id}/report_review/', {
                'review_id': review.id,
                'reason': 'spam'
            })
            self.assertEqual(response.status_code, 201)
        # Le 10e signalement doit supprimer le commentaire
        self.client.login(username='admin', password='adminpass')
        response = self.client.post(f'/movies/{self.movie.id}/report_review/', {
            'review_id': review.id,
            'reason': 'spam'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('supprimé automatiquement', response.json().get('message', ''))
        self.assertEqual(Review.objects.filter(id=review.id).count(), 0)

    def test_delete_review(self):
        self.client.login(username='testuser', password='testpass')
        review = Review.objects.create(user=self.user, movie=self.movie, rating=3, comment='À supprimer')
        response = self.client.delete(f'/movies/{self.movie.id}/delete_review/?review_id={review.id}')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Review.objects.filter(id=review.id).count(), 0) 