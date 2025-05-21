import React, { useState, useEffect } from 'react';
import { likeMovie, markMovieAsViewed, getLists, addMovieToList, getList } from '../api/listAPI';

const MovieActions = ({ movie, onUpdate }) => {
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [movieStatus, setMovieStatus] = useState({
        is_liked: movie.is_liked || false,
        is_viewed: movie.is_viewed || false
    });

    useEffect(() => {
        fetchLists();
        // Mettre à jour l'état local quand le film change
        setMovieStatus({
            is_liked: movie.is_liked || false,
            is_viewed: movie.is_viewed || false
        });
    }, [movie]);

    const fetchLists = async () => {
        try {
            const data = await getLists();
            const userLists = data.filter(list => !list.is_system);

            // Charger les films pour chaque liste
            const listsWithMovies = await Promise.all(
                userLists.map(async (list) => {
                    const detail = await getList(list.id); // getList va chercher /lists/:id/
                    return { ...list, movies: detail.movies || [] };
                })
            );
            setLists(listsWithMovies);
        } catch (err) {
            setError('Erreur lors du chargement des listes');
        }
    };

    const handleLike = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Liking movie:', movie.id);
            const result = await likeMovie(movie.id);
            console.log('Like result:', result);
            
            // Mettre à jour l'état local
            const newStatus = {
                ...movieStatus,
                is_liked: result.status === 'liked'
            };
            setMovieStatus(newStatus);
            
            // Mettre à jour l'état global
            onUpdate({
                ...movie,
                is_liked: result.status === 'liked'
            });
        } catch (err) {
            console.error('Error liking movie:', err);
            setError('Erreur lors du like');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsViewed = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Marking movie as viewed:', movie.id);
            const result = await markMovieAsViewed(movie.id);
            console.log('View result:', result);
            
            // Mettre à jour l'état local
            const newStatus = {
                ...movieStatus,
                is_viewed: result.status === 'viewed'
            };
            setMovieStatus(newStatus);
            
            // Mettre à jour l'état global
            onUpdate({
                ...movie,
                is_viewed: result.status === 'viewed'
            });
        } catch (err) {
            console.error('Error marking movie as viewed:', err);
            setError('Erreur lors du marquage comme vu');
        } finally {
            setLoading(false);
        }
    };

    const isMovieInSelectedList = () => {
        if (!selectedList) return false;
        const list = lists.find(l => l.id === parseInt(selectedList));
        if (!list || !list.movies) return false;
        return list.movies.some(movieInList => movieInList.movie && movieInList.movie.id === movie.id);
    };

    const handleAddToList = async (e) => {
        e.preventDefault();
        if (!selectedList) return;
        if (isMovieInSelectedList()) {
            setError('Ce film est déjà dans la liste sélectionnée !');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const result = await addMovieToList(selectedList, movie.id, note);
            setNote('');
            setSelectedList('');
            setSuccessMessage(result.message);
            fetchLists();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout à la liste');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <button
                    onClick={handleLike}
                    disabled={loading}
                    className={`px-4 py-2 rounded transition-colors duration-200 ${
                        movieStatus.is_liked
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {movieStatus.is_liked ? '❤️ Liké' : '🤍 Like'}
                </button>
                <button
                    onClick={handleMarkAsViewed}
                    disabled={loading}
                    className={`px-4 py-2 rounded transition-colors duration-200 ${
                        movieStatus.is_viewed
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {movieStatus.is_viewed ? '✓ Vu' : '👁️ Marquer comme vu'}
                </button>
            </div>

            <form onSubmit={handleAddToList} className="space-y-4">
                <select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={loading}
                >
                    <option value="">Sélectionner une liste...</option>
                    {lists.map(list => (
                        <option key={list.id} value={list.id}>
                            {list.name}
                        </option>
                    ))}
                </select>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note (optionnelle)"
                    className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={loading || isMovieInSelectedList()}
                >
                    {isMovieInSelectedList() ? 'Déjà dans la liste' : 'Ajouter à la liste'}
                </button>
            </form>

            {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="text-green-500 text-sm bg-green-50 p-2 rounded">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default MovieActions; 