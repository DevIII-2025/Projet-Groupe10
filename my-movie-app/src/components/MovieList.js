import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import MovieActions from './MovieActions';
import axiosInstance from '../api/axiosConfig';

// Configuration du modal
Modal.setAppElement('#root');

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '2rem',
    borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axiosInstance.get("/movies/");
        // S'assurer que chaque film a la propriété is_liked
        const moviesWithLikes = response.data.map(movie => ({
          ...movie,
          is_liked: movie.is_liked || false
        }));
        setMovies(moviesWithLikes);
      } catch (error) {
        console.error("Erreur lors de la récupération des films:", error);
      }
    };
    fetchMovies();
  }, []);

  const openModal = (movie) => {
    console.log("Film sélectionné :", movie);
    setSelectedMovie(movie);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMovie(null);
  };

  const handleMovieUpdate = (updatedMovie) => {
    setSelectedMovie(updatedMovie);
    setMovies(movies.map(movie => 
      movie.id === updatedMovie.id ? {
        ...movie,
        is_liked: updatedMovie.is_liked
      } : movie
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Liste des films</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.isArray(movies) && movies.map(movie => (
          <div
            key={movie.id}
            onClick={() => openModal(movie)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-[300px] object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-movie.jpg';
                  e.target.onerror = null;
                }}
              />
              {movie.is_liked && (
                <span className="absolute top-2 right-2 text-red-500 text-2xl">❤️</span>
              )}
              {movie.is_viewed && (
                <span className="absolute top-2 left-2 text-green-500 text-xl">✓</span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-center">{movie.title}</h2>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Détails du film"
      >
        {selectedMovie && (
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute top-0 right-0 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg';
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="md:w-2/3">
                <h1 className="text-2xl font-bold mb-2">{selectedMovie.title}</h1>
                <p className="text-gray-600 mb-2">
                  {selectedMovie.release_year} • {selectedMovie.genre}
                </p>
                <p className="text-gray-700 mb-4">{selectedMovie.description}</p>
                
                <MovieActions
                  movie={selectedMovie}
                  onUpdate={handleMovieUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
