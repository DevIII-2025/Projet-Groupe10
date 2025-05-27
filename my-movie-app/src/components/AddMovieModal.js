import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axiosInstance from '../api/axiosConfig';

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
    padding: '2rem',
    border: 'none',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
};

const AddMovieModal = ({ isOpen, onClose, onMovieAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setReleaseYear('');
      setPosterUrl('');
      setError(null);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/movies/", {
        title,
        description,
        release_year: releaseYear,
        genre: "Science-fiction",
        poster_url: posterUrl
      });
      
      onMovieAdded(response.data);
      setTitle('');
      setDescription('');
      setReleaseYear('');
      setPosterUrl('');
      onClose();
    } catch (error) {
      console.error("Erreur API:", error.message);
      setError("Impossible d'ajouter le film. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Ajouter un film"
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-gray-600 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Ajouter un nouveau film</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année de sortie
              </label>
              <input 
                type="number" 
                value={releaseYear} 
                onChange={(e) => setReleaseYear(e.target.value)} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={1888}
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'affiche
            </label>
            <input 
              type="url" 
              value={posterUrl} 
              onChange={(e) => setPosterUrl(e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={200}
            />
            {posterUrl.length === 0 && (
              <span className="text-xs text-gray-400">max. 200 caractères</span>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter le film'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddMovieModal; 