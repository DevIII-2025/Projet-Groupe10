// import { useEffect, useState } from "react";

// function MovieList() {
//   const [movies, setMovies] = useState([]);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/movies/popular/")
//       .then(response => response.json())
//       .then(data => setMovies(data));
//   }, []);

//   return (
//     <div>
//       <h1>Films Populaires (TMDB)</h1>
//       <ul>
//         {movies.map(movie => (
//           <li key={movie.id}>
//             <strong>{movie.title}</strong> - {movie.release_date}
//             <p>{movie.overview}</p>
//             <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default MovieList;


import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

// Configuration du modal
Modal.setAppElement('#root');

export default function MovieList() {
  const [movies, setMovies] = useState([]); // État pour stocker les films
  const [selectedMovie, setSelectedMovie] = useState(null); // Film sélectionné
  const [modalIsOpen, setModalIsOpen] = useState(false); // État du modal

  // Récupération des films depuis l'API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/movies/")
      .then(res => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des films");
        }
        return res.json();
      })
      .then(data => setMovies(data))
      .catch(error => console.error(error));
  }, []);

  // Fonction pour ouvrir le modal
  const openModal = (movie) => {
    console.log("Film sélectionné :", movie); // Vérifie si le clic fonctionne
    setSelectedMovie(movie);
    setModalIsOpen(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div>
      <h1>Liste des films</h1>
      <div>
        {Array.isArray(movies) && movies.map(movie => (
          <div key={movie.id} 
               onClick={() => {
                 openModal(movie);   // Ouvre le modal après l'alerte
               }} 
               style={{ cursor: 'pointer', marginBottom: '20px' }}>
            <img src={movie.poster_url} alt={movie.title} style={{ width: '150px', height: '200px' }} />
            <h2>{movie.title}</h2>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Détails du film"
      >
        {selectedMovie && (
          <>
            <h1>{selectedMovie.title}</h1>
            <img src={selectedMovie.poster_url} alt={selectedMovie.title} />
            <p>{selectedMovie.description}</p>
            <p>Année : {selectedMovie.release_year}</p>
            <button onClick={closeModal}>Fermer</button>
          </>
        )}
      </Modal>
    </div>
  );
}
