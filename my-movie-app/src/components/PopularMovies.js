import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';

const PopularMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/movies/')
      .then(res => {
        const moviesArray = Array.isArray(res.data.results) ? res.data.results : [];
        console.log('Premier film:', moviesArray[0]);
        const sorted = moviesArray.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        setMovies(sorted.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="bg-blue-50 py-8 mt-8 border-t-4 border-blue-200">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Films les plus populaires</h2>
        {movies.length === 0 ? (
          <div className="text-center text-gray-500">Aucun film populaire trouvé.</div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {movies.map(movie => (
              <div
                key={movie.id}
                className="bg-white rounded-lg shadow-md p-4 w-64 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-lg"
              >
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-48 object-cover rounded mb-3"
                  onError={e => {
                    e.target.src = 'https://img.freepik.com/vecteurs-premium/vecteur-icone-image-par-defaut-page-image-manquante-pour-conception-site-web-application-mobile-aucune-photo-disponible_87543-11093.jpg';
                    e.target.onerror = null;
                  }}
                />
                <h3 className="text-lg font-semibold text-center mb-1">{movie.title}</h3>
                <span className="text-sm text-gray-500 mb-1">{movie.release_year}</span>
                <span className="text-blue-600 font-bold">❤️ {movie.likes_count || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularMovies; 