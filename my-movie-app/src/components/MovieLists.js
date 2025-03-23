import React, { useState, useEffect } from 'react';

function MovieLists() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/lists/');
      const data = await response.json();
      console.log('Données reçues:', data);
      setLists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error);
      setLists([]); // En cas d'erreur, on initialise avec un tableau vide
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/lists/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newListName,
        }),
      });
      if (response.ok) {
        setNewListName('');
        fetchLists();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
    }
  };

  const deleteList = async (listId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/lists/${listId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchLists();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Mes Listes de Films</h2>
      
      {/* Formulaire de création de liste */}
      <form onSubmit={createList} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nom de la liste"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="flex-1 border border-gray-700 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Créer une liste
          </button>
        </div>
      </form>

      {/* Affichage des listes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div 
            key={list.id} 
            className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => setSelectedList(list)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-white">{list.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteList(list.id);
                }}
                className="text-red-500 hover:text-red-400"
              >
                Supprimer
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {list.movies.length} films
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour afficher les détails de la liste */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedList.name}</h3>
              <button
                onClick={() => setSelectedList(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {selectedList.movies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 bg-gray-700 p-4 rounded">
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title} 
                    className="w-20 h-30 object-cover rounded"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{movie.title}</h4>
                    <p className="text-gray-400">{movie.release_year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieLists; 