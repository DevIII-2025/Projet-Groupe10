import { useEffect, useState } from "react";

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/movies/popular/")
      .then(response => response.json())
      .then(data => setMovies(data));
  }, []);

  return (
    <div>
      <h1>Films Populaires (TMDB)</h1>
      <ul>
        {movies.map(movie => (
          <li key={movie.id}>
            <strong>{movie.title}</strong> - {movie.release_date}
            <p>{movie.overview}</p>
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;
