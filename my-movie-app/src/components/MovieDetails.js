import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/movies/${id}/`)
      .then(res => res.json())
      .then(data => setMovie(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!movie) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}/>
      <p>{movie.overview}</p>
      <p>Date de sortie : {movie.release_date}</p>
      <p>Note moyenne : {movie.vote_average}</p>
      <p>Nombre de votes : {movie.vote_count}</p>
    </div>
  );
}
