import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovieDetails from "./components/MovieDetails";
import Home from './components/Home';
import Modal from 'react-modal';
Modal.setAppElement('#root');

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [showPopular, setShowPopular] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'liked', ou 'watchlist'
  const [likedMovies, setLikedMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/movies/");
      const data = await response.json();
      const uniqueMovies = data.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      );
      setMovies(uniqueMovies);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const toggleLike = (movie) => {
    setLikedMovies(prevLikedMovies => {
      const isLiked = prevLikedMovies.some(m => m.id === movie.id);
      if (isLiked) {
        return prevLikedMovies.filter(m => m.id !== movie.id);
      } else {
        return [...prevLikedMovies, movie];
      }
    });
  };

  const toggleWatchlist = (movie) => {
    setWatchlistMovies(prevWatchlistMovies => {
      const isInWatchlist = prevWatchlistMovies.some(m => m.id === movie.id);
      if (isInWatchlist) {
        return prevWatchlistMovies.filter(m => m.id !== movie.id);
      } else {
        return [...prevWatchlistMovies, movie];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (movies.some(movie => movie.title === title && movie.release_year === releaseYear)) {
      alert("❌ Ce film existe déjà !");
      return;
    }
    fetch("http://127.0.0.1:8000/api/movies/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        release_year: releaseYear,
        genre: "Science-fiction",
        poster_url: posterUrl
      }),
    })
      .then(response => response.json())
      .then(data => {
        setMovies(prevMovies => [...prevMovies, data]);
        setTitle("");
        setDescription("");
        setReleaseYear("");
        setPosterUrl("");
      })
      .catch(error => console.error("Erreur API:", error.message));
  };

  const sortMovies = () => {
    const sortedMovies = [...movies].sort((a, b) => a.release_year - b.release_year);
    setMovies(sortedMovies);
  };

  const displayedMovies = {
    all: movies,
    liked: likedMovies,
    watchlist: watchlistMovies
  }[viewMode];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {/* Navigation */}
      <div className="w-full flex justify-center mb-8">
        <button
          className={`px-6 py-2 mx-2 rounded ${
            viewMode === 'all'
              ? "bg-blue-600 text-white" 
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setViewMode('all')}
        >
          Tous les Films
        </button>
        <button
          className={`px-6 py-2 mx-2 rounded ${
            viewMode === 'liked'
              ? "bg-blue-600 text-white" 
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setViewMode('liked')}
        >
          Films Likés
        </button>
        <button
          className={`px-6 py-2 mx-2 rounded ${
            viewMode === 'watchlist'
              ? "bg-blue-600 text-white" 
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => setViewMode('watchlist')}
        >
          Enregisté
        </button>
      </div>

      {/* Titre */}
      <h1 className="text-4xl font-bold text-blue-400 mb-4">
        {viewMode === 'all' ? "Films disponibles" : 
         viewMode === 'liked' ? "Films Likés" : "Enregisté"}
      </h1>

      {/* Bouton de tri */}
      <button
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 mb-4"
        onClick={sortMovies}
      >
        Trier par année
      </button>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un film..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-700 rounded mb-4 bg-gray-800 text-white placeholder-gray-400"
      />

      {/* Liste des films */}
      <ul className="w-3/4 bg-gray-800 shadow-lg rounded-lg p-4 mb-8">
        {displayedMovies
          .filter(movie => movie?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((movie) => (
            <div key={movie.id}>
              <li className="border-b border-gray-700 last:border-none py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img src={movie.poster_url} alt={movie.title} className="w-20 h-30 object-cover mr-4" />
                  <div>
                    <strong className="text-lg text-white">{movie.title}</strong> - {movie.release_year} ({movie.genre})
                    <p className="text-gray-300">{movie.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLike(movie)}
                    className={`px-4 py-2 rounded ${
                      likedMovies.some(m => m.id === movie.id)
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {likedMovies.some(m => m.id === movie.id) ? "❤️" : "🤍"}
                  </button>
                  <button
                    onClick={() => toggleWatchlist(movie)}
                    className={`px-4 py-2 rounded ${
                      watchlistMovies.some(m => m.id === movie.id)
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                    title={watchlistMovies.some(m => m.id === movie.id) ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
                  >
                    {watchlistMovies.some(m => m.id === movie.id) ? "📺" : "➕"}
                  </button>
                </div>
              </li>
            </div>
          ))}
      </ul>

      {/* Formulaire d'ajout */}
      {viewMode === 'all' && (
        <form onSubmit={handleSubmit} className="bg-gray-800 shadow-lg rounded-lg p-6 mt-4 w-3/4">
          <h2 className="text-2xl font-semibold text-white mb-4">Ajouter un film</h2>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-gray-700 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="border border-gray-700 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Année de sortie"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              required
              className="border border-gray-700 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="URL de l'affiche"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              required
              className="border border-gray-700 p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded w-full mt-4 hover:bg-blue-700">
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
