import { useEffect, useState } from "react";

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [posterUrl, setPosterUrl] = useState("");


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/movies/")
      .then(response => response.json())
      .then(data => {
        console.log("✅ Films reçus depuis l'API :", data);

        // Supprimer les doublons avant d'afficher
        const uniqueMovies = data.filter((movie, index, self) =>
          index === self.findIndex((m) => m.id === movie.id)
        );

        console.log("🚀 Liste des films sans doublons :", uniqueMovies);
        setMovies(uniqueMovies);
      })
      .catch(error => console.error("Erreur :", error));
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier si le film existe déjà dans la liste
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
        console.log("🎬 Film ajouté :", data);

        setMovies((prevMovies) => [...prevMovies, data]); // Empêche les doublons
        setTitle("");
        setDescription("");
        setReleaseYear("");
      })
      .catch(error => console.error("Erreur API:", error.message));
  };



  // const handleDelete = (id) => {
  //   fetch(`http://127.0.0.1:8000/api/movies/${id}/`, {
  //     method: "DELETE",
  //   })
  //     .then(() => {
  //       setMovies(movies.filter(movie => movie.id !== id));
  //     })
  //     .catch(error => console.error("Erreur API:", error.message));
  // };

  const sortMovies = () => {
    const sortedMovies = [...movies].sort((a, b) => a.release_year - b.release_year);
    setMovies(sortedMovies);
  };


  // console.log("Movies State :", movies);
  // console.log("Classes Tailwind appliquées :", document.body.classList);
  console.log("🧐 Liste des films affichés :", movies);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">

      {/* Titre */}
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Films disponibles</h1>

      {/* Bouton de tri */}
      <button
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mb-4"
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
        className="w-full p-2 border rounded mb-4"
      />

      {/* Liste des films */}
      <ul className="w-3/4 bg-white shadow-md rounded-lg p-4">
        {movies
          .filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((movie, index) => (
            <div>
              <li key={`${movie.id}-${index}`} className="border-b last:border-none py-4 flex items-center">
                <img src={movie.poster_url} alt={movie.title} className="w-20 h-30 object-cover mr-4" />
                <div>
                  <strong className="text-lg">{movie.title}</strong> - {movie.release_year} ({movie.genre})
                  <p className="text-gray-600">{movie.description}</p>
                </div>
              </li>
              {/* <li key={movie.id} className="border-b last:border-none py-4 flex justify-between items-center">
              <div>
                <strong className="text-lg">{movie.title}</strong> - {movie.release_year}
                <p className="text-gray-600">{movie.description}</p>
              </div>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(movie.id)}
              >
                Supprimer
              </button>
            </li> */}
            </div>
          ))}
      </ul>

      {/* Titre du formulaire */}
      <h2 className="text-2xl font-semibold mt-8">Ajouter un film</h2>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-4 w-3/4 transition-transform transform scale-95 hover:scale-100">
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
          <input
            type="text"
            placeholder="URL de l'affiche"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
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
