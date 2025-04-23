import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MovieDetails from "./components/MovieDetails";
import Modal from 'react-modal';
import Home from './components/Home';
import LoginForm from "./components/LoginForm";
import Register from "./components/Register";
import LogoutButton from "./components/LogoutButton";
import ProfileButton from "./components/ProfileButton";
import Lists from "./components/Lists";
import ListContent from "./components/ListContent";
import MovieActions from "./components/MovieActions";
import { AuthProvider, useAuth } from "./context/AuthContext";
import axiosInstance from './api/axiosConfig';

Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '800px',
    width: '90%',
    padding: '0',
    border: 'none',
    background: 'none',
    overflow: 'visible'
  }
};

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showLists, setShowLists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const [sortBy, setSortBy] = useState("");

  const fetchMovies = (page = 1, search = '', sort = sortBy) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    
    let url = `/movies/?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
      setSearchTerm(search.trim() !== "" ? search : "");
    } else {
      setSearchTerm("");
    }
    if (sort) {
      url += `&ordering=${sort}`;
    }
    
    axiosInstance.get(url)
      .then(response => {
        setMovies(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 24));
        setTotalMovies(response.data.count);
        setCurrentPage(page);
      })
      .catch(error => {
        console.error("Erreur :", error);
        setError("Impossible de charger les films. Veuillez réessayer plus tard.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMovies(1, "", sortBy);
  }, [user, sortBy]);

  const validateForm = () => {
    if (!title.trim()) {
      setError("Le titre est requis");
      return false;
    }
    if (!description.trim()) {
      setError("La description est requise");
      return false;
    }
    if (!releaseYear || isNaN(releaseYear) || releaseYear < 1888 || releaseYear > new Date().getFullYear()) {
      setError("L'année doit être valide (entre 1888 et l'année actuelle)");
      return false;
    }
    try {
      new URL(posterUrl);
    } catch {
      setError("L'URL de l'affiche doit être valide");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    if (movies.some(movie => movie.title === title && movie.release_year === releaseYear)) {
      setError("❌ Ce film existe déjà !");
      return;
    }

    setIsLoading(true);
    axiosInstance.post("/movies/", {
      title,
      description,
      release_year: releaseYear,
      genre: "Science-fiction",
      poster_url: posterUrl
    })
      .then(response => {
        fetchMovies(currentPage, searchTerm, sortBy);
        setTitle("");
        setDescription("");
        setReleaseYear("");
        setPosterUrl("");
        setError(null);
      })
      .catch(error => {
        console.error("Erreur API:", error.message);
        setError("Impossible d'ajouter le film. Veuillez réessayer plus tard.");
      })
      .finally(() => setIsLoading(false));
  };

  const sortMovies = () => {
    const newSortBy = sortBy === 'release_year' ? '-release_year' : 'release_year';
    setSortBy(newSortBy);
  };

  const openModal = (movieId) => {
    axiosInstance.get(`/movies/${movieId}/`)
      .then(response => {
        setSelectedMovie(response.data);
        setModalIsOpen(true);
      })
      .catch(err => console.error(err));
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMovie(null);
  };

  const handleMovieUpdate = (updatedMovie) => {
    setMovies(movies.map(movie => 
      movie.id === updatedMovie.id ? updatedMovie : movie
    ));
    if (selectedMovie?.id === updatedMovie.id) {
      setSelectedMovie(updatedMovie);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    fetchMovies(1, inputValue, sortBy);
    setInputValue("");
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <div className="w-full max-w-6xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Films disponibles</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Connecté en tant que <strong>{user.username}</strong>
            </p>
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            onClick={() => setShowLists(!showLists)}
          >
            {showLists ? "Voir Films" : "Voir Mes Listes"}
          </button>
        </div>

        {showLists ? (
          selectedList ? (
            <ListContent
              list={selectedList}
              onBack={() => setSelectedList(null)}
            />
          ) : (
            <Lists onSelectList={setSelectedList} />
          )
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                onClick={sortMovies}
              >
                Trier par année
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex mb-4">
              <input
                type="text"
                placeholder="Rechercher un film..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border rounded-l"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r"
              >
                Rechercher
              </button>
            </form>
            
            {searchTerm && searchTerm.trim() !== "" && (
              <div className="mb-4">
                {movies.length > 0 ? (
                  <p className="text-gray-600">Résultats de recherche pour : <span className="font-medium">{searchTerm}</span></p>
                ) : (
                  <p className="text-gray-600">Aucun résultat trouvé pour : <span className="font-medium">{searchTerm}</span></p>
                )}
              </div>
            )}

            <div className="flex justify-center items-center mt-4 mb-8">
              <button 
                className={`px-6 py-2 ${currentPage === 1 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                onClick={() => fetchMovies(Math.max(currentPage - 1, 1), searchTerm, sortBy)}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              
              <span className="mx-4">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button 
                className={`px-6 py-2 ${currentPage >= totalPages ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                onClick={() => fetchMovies(Math.min(currentPage + 1, totalPages), searchTerm, sortBy)}
                disabled={currentPage >= totalPages}
              >
                Suivant
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-6 gap-6 mb-6">
                {movies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="cursor-pointer flex flex-col items-center"
                    onClick={() => openModal(movie.id)}
                  >
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className="w-full h-64 object-cover rounded transition-transform hover:scale-110" 
                    />
                    <h3 className="mt-2 text-center font-medium line-clamp-2 overflow-hidden">{movie.title}</h3>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center items-center mt-4 mb-8">
              <button 
                className={`px-6 py-2 ${currentPage === 1 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                onClick={() => fetchMovies(Math.max(currentPage - 1, 1), searchTerm, sortBy)}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              
              <span className="mx-4">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button 
                className={`px-6 py-2 ${currentPage >= totalPages ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded`}
                onClick={() => fetchMovies(Math.min(currentPage + 1, totalPages), searchTerm, sortBy)}
                disabled={currentPage >= totalPages}
              >
                Suivant
              </button>
            </div>
            
            <h2 className="text-2xl font-semibold mt-8">Ajouter un film</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-4 w-full">
              <div className="grid grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Titre" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  className="border p-2 w-full rounded" 
                  maxLength={200}
                />
                <input 
                  type="text" 
                  placeholder="Description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  className="border p-2 w-full rounded"
                  maxLength={1000}
                />
                <input 
                  type="number" 
                  placeholder="Année de sortie" 
                  value={releaseYear} 
                  onChange={(e) => setReleaseYear(e.target.value)} 
                  required 
                  className="border p-2 w-full rounded"
                  min={1888}
                  max={new Date().getFullYear()}
                />
                <input 
                  type="url" 
                  placeholder="URL de l'affiche" 
                  value={posterUrl} 
                  onChange={(e) => setPosterUrl(e.target.value)} 
                  required 
                  className="border p-2 w-full rounded"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-500 text-white rounded w-full mt-4 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </form>
          </>
        )}

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Détails du film"
        >
          {selectedMovie && (
            <MovieDetails 
              movie={selectedMovie} 
              onClose={closeModal}
              onUpdate={handleMovieUpdate}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<ProtectedApp />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
