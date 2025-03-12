import { useEffect, useState } from "react";

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/movies/")
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error("Erreur :", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    fetch("http://127.0.0.1:8000/api/movies/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        release_year: releaseYear,
        genre: "Science-fiction", // obligatoire, exemple temporaire
        poster_url: "https://example.com/poster.jpg" // obligatoire, exemple temporaire
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(JSON.stringify(data));
          });
        }
        return response.json();
      })
      .then(data => {
        setMovies([...movies, data]);
        setTitle("");
        setDescription("");
        setReleaseYear("");
      })
      .catch(error => console.error("Erreur API:", error.message));
  };
  
console.log("Movies State :", movies);
console.log("Classes Tailwind appliquées :", document.body.classList);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      
      {/* Titre */}
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Films disponibles</h1>

      <button className="bg-red-500 text-white px-4 py-2 rounded mt-4">Bouton Test Rouge</button>

      {/* Liste des films */}
      <ul className="w-3/4 bg-white shadow-md rounded-lg p-4">
        {movies.map(movie => (
          <li key={movie.id} className="border-b last:border-none py-4">
            <strong className="text-lg">{movie.title}</strong> - {movie.release_year}
            <p className="text-gray-600">{movie.description}</p>
          </li>
        ))}
      </ul>

      {/* Titre du formulaire */}
      <h2 className="text-2xl font-semibold mt-8">Ajouter un film</h2>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-4 w-3/4">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            placeholder="Année de sortie"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded w-full mt-4">
          Ajouter
        </button>
      </form>

      {/* Texte de test (il doit toujours apparaître en rouge) */}
      <p className="test mt-6">Texte de test en rouge</p>
    </div>
  );
}

export default App;
