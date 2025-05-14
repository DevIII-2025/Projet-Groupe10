import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import MovieActions from './MovieActions';
import './MovieDetails.css';

const MovieDetails = ({ movie, onClose, onUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' ou 'reported'
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [reportModal, setReportModal] = useState(null);
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  const [selectedReport, setSelectedReport] = useState(null);
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

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/movies/${movie.id}/reviews/`);
      setReviews(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
    }
  };

  const fetchReportedReviews = async () => {
    try {
      if (user?.is_staff) {
        console.log("Fetching reported reviews for movie:", movie.id);
        const response = await axiosInstance.get(`/movies/${movie.id}/reported_reviews/`);
        console.log("Reported reviews response:", response.data);
        setReportedReviews(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires signalés:", error);
      if (error.response?.status === 403) {
        setError("Accès non autorisé. Seuls les administrateurs peuvent voir les commentaires signalés.");
      }
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchReportedReviews();
  }, [movie.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post(`/movies/${movie.id}/add_review/`, {
        rating: newReview.rating,
        comment: newReview.comment,
        movie: movie.id
      });
      
      const updatedReviews = [response.data, ...reviews];
      setReviews(updatedReviews);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      setError(error.response?.data?.error || 'Une erreur est survenue lors de l\'ajout du commentaire');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axiosInstance.delete(`/movies/${movie.id}/delete_review/`, {
        params: { review_id: reviewId }
      });
      setReviews(reviews.filter(review => review.id !== reviewId));
      setReportedReviews(reportedReviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      setError('Une erreur est survenue lors de la suppression du commentaire');
    }
  };

  const handleReportReview = async (reviewId) => {
    try {
      console.log("Reporting review:", reviewId);
      const response = await axiosInstance.post(`/movies/${movie.id}/report_review/`, {
        review_id: reviewId,
        reason: reportData.reason,
        description: reportData.description
      });
      
      console.log("Report response:", response.data);
      
      // Si le commentaire a été supprimé automatiquement
      if (response.data.message && response.data.message.includes('supprimé automatiquement')) {
        setReviews(reviews.filter(review => review.id !== reviewId));
        setReportedReviews(reportedReviews.filter(review => review.id !== reviewId));
      } else {
        // Sinon, mettre à jour le statut du commentaire
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, is_reported: true, report_count: (review.report_count || 0) + 1 } : review
        ));
      }
      
      await fetchReportedReviews();
      
      setReportModal(null);
      setReportData({ reason: '', description: '' });
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      setError(error.response?.data?.error || 'Une erreur est survenue lors du signalement');
    }
  };

  // Calcul de la moyenne des notes
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'Aucune note';

  return (
    <div className="movie-details-modal">
      {user?.is_staff && (
        <div className="admin-banner">
          <strong>Vous êtes connecté en tant qu'administrateur.</strong>
        </div>
      )}
      <div className="movie-header">
        <h2 className="movie-title">{movie.title}</h2>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <div className="movie-content">
        <div className="movie-main-info">
          <img src={movie.poster_url} alt={movie.title} className="movie-poster"/>
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
          <div className="reviews-tabs">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tous les commentaires
            </button>
            {user?.is_staff && (
              <button 
                className={`tab-button ${activeTab === 'reported' ? 'active' : ''}`}
                onClick={() => setActiveTab('reported')}
              >
                Commentaires signalés
              </button>
            )}
          </div>

          {user && activeTab === 'all' && (
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
            {activeTab === 'all' ? (
              reviews.length === 0 ? (
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
                      <div className="review-actions">
                        {user && (
                          review.user && user.username === review.user.username || user.is_staff
                        ) && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="delete-review"
                            title="Supprimer le commentaire"
                          >
                            Supprimer
                          </button>
                        )}
                        {user && (!review.user || user.username !== review.user.username) && !review.is_reported && (
                          <button
                            onClick={() => setReportModal(review.id)}
                            className="report-review"
                            title="Signaler le commentaire"
                          >
                            Signaler
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )
            ) : (
              reportedReviews.length === 0 ? (
                <p className="no-reviews">Aucun commentaire signalé pour le moment.</p>
              ) : (
                reportedReviews.map(review => (
                  <div key={review.id} className="review reported">
                    <div className="review-header">
                      <div className="review-info">
                        <span className="review-author">{review.user?.username}</span>
                        <span className="review-rating">
                          {renderStars(review.rating)}
                        </span>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <span className="reported-badge">Signalé</span>
                      </div>
                      <div className="review-actions">
                        {user && (
                          review.user && user.username === review.user.username || user.is_staff
                        ) && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="delete-review"
                            title="Supprimer le commentaire"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal de signalement */}
      {reportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Signaler un commentaire</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReportReview(reportModal);
            }}>
              <div className="form-group">
                <label>Raison du signalement :</label>
                <select
                  value={reportData.reason}
                  onChange={(e) => setReportData({...reportData, reason: e.target.value})}
                  required
                >
                  <option value="">Sélectionnez une raison</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="hate_speech">Discours haineux</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description (optionnelle) :</label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                  placeholder="Décrivez la raison de votre signalement..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setReportModal(null)}>Annuler</button>
                <button type="submit">Signaler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
