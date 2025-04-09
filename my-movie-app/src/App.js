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
import MovieList from "./components/MovieList";
import { AuthProvider, useAuth } from "./context/AuthContext";

Modal.setAppElement('#root');

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [showLists, setShowLists] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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
        setTitle("");
        setDescription("");
        setReleaseYear("");
        setPosterUrl("");
      })
      .catch(error => console.error("Erreur API:", error.message));
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
            <MovieList />
            
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
