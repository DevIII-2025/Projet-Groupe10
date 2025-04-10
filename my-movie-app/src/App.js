import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MovieDetails from "./components/MovieDetails";
import Modal from 'react-modal';
import Home from './components/Home';
import LoginForm from "./components/LoginForm";
import Register from "./components/Register";
import LogoutButton from "./components/LogoutButton";
import Lists from "./components/Lists";
import ListContent from "./components/ListContent";
import MovieActions from "./components/MovieActions";
import { AuthProvider, useAuth } from "./context/AuthContext";

Modal.setAppElement('#root');

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showLists, setShowLists] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("http://127.0.0.1:8000/api/movies/", {
      credentials: "include"
    })
      .then(response => response.json())
      .then(data => {
        const uniqueMovies = data.filter((movie, index, self) =>
          index === self.findIndex((m) => m.id === movie.id)
        );
        setMovies(uniqueMovies);
      })
      .catch(error => console.error("Erreur :", error));
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (movies.some(movie => movie.title === title && movie.release_year === releaseYear)) {
      alert("❌ Ce film existe déjà !");
      return;
    }
    fetch("http://127.0.0.1:8000/api/movies/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
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
        setMovies((prevMovies) => [...prevMovies, data]);
        setTitle("");
        setDescription("");
        setReleaseYear("");
      })
      .catch(error => console.error("Erreur API:", error.message));
  };

  const sortMovies = () => {
    const sortedMovies = [...movies].sort((a, b) => a.release_year - b.release_year);
    setMovies(sortedMovies);
  };

  const openModal = (movieId) => {
    fetch(`http://127.0.0.1:8000/api/movies/${movieId}/`, { credentials: "include" })
      .then(response => response.json())
      .then(data => {
        setSelectedMovie(data);
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

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Films disponibles</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Connecté en tant que <strong>{user.username}</strong>
            </p>
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
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mb-4"
              onClick={sortMovies}
            >
              Trier par année
            </button>

            <input
              type="text"
              placeholder="Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
            </Routes>

            <ul className="w-3/4 bg-white shadow-md rounded-lg p-4">
              {movies
                .filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((movie, index) => (
                  <li
                    key={`${movie.id}-${index}`}
                    className="border-b last:border-none py-4 flex items-center cursor-pointer"
                    onClick={() => openModal(movie.id)}
                  >
                    <img src={movie.poster_url} alt={movie.title} className="w-20 h-30 object-cover mr-4" />
                    <div>
                      <strong className="text-lg">{movie.title}</strong> - {movie.release_year} ({movie.genre})
                      <p className="text-gray-600">{movie.description}</p>
                    </div>
                  </li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-8">Ajouter un film</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-4 w-3/4">
              <div className="grid grid-cols-3 gap-4">
                <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required className="border p-2 w-full rounded" />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="border p-2 w-full rounded" />
                <input type="number" placeholder="Année de sortie" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} required className="border p-2 w-full rounded" />
                <input type="text" placeholder="URL de l'affiche" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} required className="border p-2 w-full rounded" />
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded w-full mt-4">Ajouter</button>
            </form>
          </>
        )}

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="bg-white p-6 rounded-lg shadow-lg mx-auto mt-20 outline-none max-w-2xl"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
        >
          {selectedMovie ? (
            <>
              <div className="flex gap-6">
                <img src={selectedMovie.poster_url} alt={selectedMovie.title} className="w-48 h-72 object-cover rounded" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                  <p className="mb-2">{selectedMovie.description}</p>
                  <p className="mb-2"><strong>Genre :</strong> {selectedMovie.genre}</p>
                  <p className="mb-4"><strong>Année :</strong> {selectedMovie.release_year}</p>
                  <MovieActions movie={selectedMovie} onUpdate={handleMovieUpdate} />
                </div>
              </div>
              <button onClick={closeModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Fermer</button>
            </>
          ) : (
            <p>Chargement...</p>
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
