import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import MovieActions from './MovieActions';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage]);

  const fetchMovies = async (page) => {
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`http://127.0.0.1:8000/api/movies/?page=${page}${searchParam}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des films");
      }
      const data = await res.json();
      console.log('API Response:', data); // Debug log
      
      // Handle DRF paginated response format
      if (data && data.results && Array.isArray(data.results)) {
        setMovies(data.results);
        // Calculate total pages from count and page size (40)
        setTotalPages(Math.ceil(data.count / 40));
      } else {
        console.error('Invalid data format:', data);
        setMovies([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
      setTotalPages(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLastSearchQuery(searchQuery); // Save the current search query
    setCurrentPage(1); // Reset to first page when searching
    fetchMovies(1);
    // Clear the search input after search is performed
    setSearchQuery("");
  };

  const openModal = (movie) => {
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
      movie.id === updatedMovie.id ? updatedMovie : movie
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Liste des films</h1>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher un film..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Suivant
        </button>
      </div>

      <div className="grid grid-cols-6 gap-6">
        {Array.isArray(movies) && movies.length > 0 ? (
          movies.map(movie => (
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
                  <span className="absolute top-2 right-2 text-red-500 text-3xl">❤️</span>
                )}
                {movie.is_viewed && (
                  <span className="absolute top-2 left-2 text-green-500 text-2xl">✓</span>
                )}
              </div>
              <h2 className="mt-3 text-base font-semibold text-center truncate">{movie.title}</h2>
            </div>
          ))
        ) : (
          <div className="col-span-6 text-center py-12">
            <p className="text-xl text-gray-600">
              {lastSearchQuery 
                ? `Aucun résultat pour : "${lastSearchQuery}"` 
                : "Aucun film disponible"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom pagination controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Suivant
        </button>
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
