import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import MovieActions from './MovieActions';
import './MovieDetails.css';

const defaultImage = require('../images/image_par_defaut.png');

const MovieDetails = ({ movie, onClose, onUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fonction pour générer les étoiles
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Ajoute les étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }

    // Ajoute une demi-étoile si nécessaire
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">◐</span>);
    }

    // Ajoute les étoiles vides pour compléter jusqu'à 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/movies/${movie.id}/reviews/`);
        setReviews(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commentaires:", error);
      }
    };
    fetchReviews();
  }, [movie.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/movies/${movie.id}/add_review/`, newReview);
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axiosInstance.delete(`/movies/${movie.id}/delete_review/`);
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
    }
  };

  // Calcul de la moyenne des notes
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'Aucune note';

  return (
    <div className="movie-details-modal">
      <div className="movie-header">
        <h2 className="movie-title">{movie.title}</h2>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <div className="movie-content">
        <div className="movie-main-info">
          <img
            src={movie.poster_url || defaultImage}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = defaultImage;
              e.target.onerror = null;
            }}
          />
          <div className="movie-text">
            <p className="movie-year"><strong>Année :</strong> {movie.release_year}</p>
            <p className="movie-genre"><strong>Genre :</strong> {movie.genre}</p>
            <p className="movie-description">{movie.description}</p>
            <div className="movie-stats">
              <div className="average-rating">
                <span className="rating-label">Note moyenne :</span>
                <span className="rating-value">
                  {averageRating !== 'Aucune note' ? (
                    <>
                      {averageRating}
                      <span className="rating-stars">
                        {renderStars(parseFloat(averageRating))}
                      </span>
                      <span className="rating-count">({reviews.length} avis)</span>
                    </>
                  ) : (
                    'Aucune note'
                  )}
                </span>
              </div>
            </div>
            <div className="movie-actions">
              <MovieActions movie={movie} onUpdate={onUpdate} />
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h3>Commentaires</h3>
          
          {user && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Note :</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} étoile{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Commentaire :</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Partagez votre avis sur ce film..."
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit">Publier</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">Aucun commentaire pour le moment. Soyez le premier à donner votre avis !</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review">
                  <div className="review-header">
                    <div className="review-info">
                      <span className="review-author">{review.user?.username}</span>
                      <span className="review-rating">
                        {renderStars(review.rating)}
                      </span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {user && review.user && user.username === review.user.username && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="delete-review"
                        title="Supprimer le commentaire"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
