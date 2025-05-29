import React, { useState, useEffect } from 'react';
import { getList, removeMovieFromList } from '../api/listAPI';
import axiosInstance from '../api/axiosConfig';

const ListContent = ({ list, onBack }) => {
    const [listContent, setListContent] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [movieToRemove, setMovieToRemove] = useState(null);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        if (list?.id) {
            fetchListContent();
        }
    }, [list?.id]);

    const fetchListContent = async () => {
        try {
            console.log('Fetching list content for list:', list.id);
            const data = await getList(list.id);
            console.log('Received list content:', data);
            
            if (!data || !Array.isArray(data.movies)) {
                throw new Error('Format de données invalide');
            }
            
            setListContent(data);
            setError(null);
        } catch (err) {
            console.error('Error in fetchListContent:', err);
            setError(err.message || 'Erreur lors du chargement de la liste');
            setListContent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMovie = async (movieId) => {
        setRemoving(true);
        try {
            console.log('Removing movie:', movieId, 'from list:', list.id);

            if (list.is_system) {
                if (list.name === "Favoris") {
                    await axiosInstance.post(`/movies/${movieId}/like/`, { block: false });
                } else if (list.name === "Déjà vu") {
                    await axiosInstance.post(`/movies/${movieId}/view/`, { block: false });
                } else {
                    await removeMovieFromList(list.id, movieId);
                }
            } else {
                await removeMovieFromList(list.id, movieId);
            }
            
            setListContent(prev => ({
                ...prev,
                movies: prev.movies.filter(m => m.movie.id !== movieId)
            }));
            
            console.log('Movie removed successfully');
        } catch (err) {
            console.error('Error removing movie:', err);
            setError(err.message || 'Erreur lors de la suppression du film');
        } finally {
            setRemoving(false);
            setMovieToRemove(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-gray-600">Chargement de la liste...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 font-semibold">Erreur</div>
                <div className="text-red-500">{error}</div>
                <button
                    onClick={fetchListContent}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!listContent) {
        return (
            <div className="text-center text-gray-600 p-8">
                Liste non trouvée
                <button
                    onClick={onBack}
                    className="block mx-auto mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                    ← Retour aux listes
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{listContent.name}</h2>
                    {listContent.description && (
                        <p className="text-gray-600 mt-1">{listContent.description}</p>
                    )}
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    ← Retour aux listes
                </button>
            </div>

            <div className="space-y-4">
                {listContent.movies && listContent.movies.length > 0 ? (
                    listContent.movies.map(({ movie, note }) => (
                        <div
                            key={movie.id}
                            className="group relative flex items-start gap-6 p-6 rounded-2xl backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:hover:bg-gray-800/40"
                        >
                            <div className="relative w-32 h-48 flex-shrink-0">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                                    onError={(e) => {
                                        e.target.src = 'https://img.freepik.com/vecteurs-premium/vecteur-icone-image-par-defaut-page-image-manquante-pour-conception-site-web-application-mobile-aucune-photo-disponible_87543-11093.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{movie.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {movie.release_year} • {movie.genre}
                                </p>
                                <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-3">{movie.description}</p>
                                {note && (
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                        Note : {note}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setMovieToRemove(movie)}
                                className="absolute top-4 right-4 px-3 py-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-300"
                            >
                                Retirer
                            </button>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/0 transition-all duration-500 -z-10" />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Cette liste est vide
                    </div>
                )}
            </div>

            {movieToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirmer le retrait</h3>
                        <p className="mb-6 text-gray-700">
                            Voulez-vous vraiment retirer <span className="font-semibold">{movieToRemove.title}</span> de la liste ?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setMovieToRemove(null)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded"
                                disabled={removing}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleRemoveMovie(movieToRemove.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={removing}
                            >
                                {removing ? 'Retrait...' : 'Retirer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListContent; 