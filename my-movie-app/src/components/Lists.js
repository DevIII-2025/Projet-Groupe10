import React, { useState, useEffect } from 'react';
import { getLists, createList, deleteList } from '../api/listAPI';

const Lists = ({ onSelectList }) => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [error, setError] = useState(null);
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [listToDelete, setListToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    // Ajout forcé de Favoris et Déjà vu si absents
    const ensureSystemLists = (lists) => {
        const systemLists = [
            { name: 'Favoris', description: 'Films que vous avez aimés', movies_count: 0, is_system: true, id: 'favoris-fake' },
            { name: 'Déjà vu', description: 'Films que vous avez vus', movies_count: 0, is_system: true, id: 'dejavu-fake' },
        ];
        const names = lists.map(l => l.name);
        systemLists.forEach(sys => {
            if (!names.includes(sys.name)) {
                lists.push(sys);
            }
        });
        // Toujours trier pour mettre Favoris et Déjà vu en haut
        return [
            ...systemLists.map(sys => lists.find(l => l.name === sys.name)),
            ...lists.filter(l => !systemLists.some(sys => sys.name === l.name))
        ].filter(Boolean);
    };

    const fetchLists = async () => {
        try {
            console.log('Fetching lists...');
            const data = await getLists();
            console.log('Lists data received:', data);
            setLists(ensureSystemLists(data));
        } catch (err) {
            console.error('Error fetching lists:', err);
            setError(err.message || 'Erreur lors du chargement des listes');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour afficher une erreur temporaire
    const showTemporaryError = (message) => {
        setError(message);
        setIsErrorVisible(true);
        setTimeout(() => {
            setIsErrorVisible(false);
            setTimeout(() => setError(null), 300);
        }, 3000);
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        // Vérification côté frontend
        if (lists.some(list => list.name.trim().toLowerCase() === newListName.trim().toLowerCase())) {
            showTemporaryError('Une liste avec ce nom existe déjà.');
            return;
        }

        try {
            const newList = await createList(newListName);
            setLists([...lists, newList]);
            setNewListName('');
        } catch (err) {
            showTemporaryError(err.message);
        }
    };

    const handleDeleteList = async () => {
        if (!listToDelete) return;
        setDeleting(true);
        try {
            console.log('Deleting list:', listToDelete.id);
            await deleteList(listToDelete.id);
            console.log('List deleted successfully');
            setLists(lists.filter(list => list.id !== listToDelete.id));
            setListToDelete(null);
        } catch (err) {
            console.error('Error deleting list:', err);
            setError(err.message || 'Erreur lors de la suppression de la liste');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="text-center py-4">Chargement des listes...</div>;

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Mes Listes</h2>
            {error && (
                <div className={`mb-4 p-3 bg-red-100 text-red-700 rounded-lg transition-all duration-300 transform ${
                    isErrorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleCreateList} className="mb-6">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nouvelle liste..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-all duration-300 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden group"
                    >
                        <span className="relative z-10">Créer</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-200" />
                    </button>
                </div>
            </form>

            <div className="space-y-2">
                {lists.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        Vous n'avez pas encore de listes. Créez-en une !
                    </div>
                ) : (
                    lists.map(list => (
                        <div
                            key={list.id}
                            className="group relative flex items-center justify-between p-4 rounded-xl bg-white/95 dark:bg-gray-700/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => onSelectList(list)}
                            >
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{list.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {list.movies_count} films
                                </p>
                            </div>
                            {/* On ne permet pas de supprimer Favoris/Déjà vu */}
                            {!list.is_system && (
                                <button
                                    onClick={() => setListToDelete(list)}
                                    className="group relative px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    Supprimer
                                </button>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/0 transition-all duration-500 -z-10" />
                        </div>
                    ))
                )}
            </div>

            {listToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-700">Voulez-vous vraiment supprimer la liste <span className="font-semibold">{listToDelete.name}</span> ?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setListToDelete(null)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded"
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteList}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={deleting}
                            >
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lists; 