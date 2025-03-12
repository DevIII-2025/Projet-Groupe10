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
  

  return (
    <div>
      <h1>Films disponibles</h1>
      <ul>
        {movies.map(movie => (
          <li key={movie.id}>
            <strong>{movie.title}</strong> - {movie.release_year}
            <p>{movie.description}</p>
          </li>
        ))}
      </ul>

      <h2>Ajouter un film</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Année de sortie"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
          required
        />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default App;
