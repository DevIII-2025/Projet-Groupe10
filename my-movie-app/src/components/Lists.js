import React, { useState, useEffect } from 'react';
import { getLists, createList, deleteList } from '../api/listAPI';

const Lists = ({ onSelectList }) => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listToDelete, setListToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            console.log('Fetching lists...');
            const data = await getLists();
            console.log('Lists data received:', data);
            setLists(data);
        } catch (err) {
            console.error('Error fetching lists:', err);
            setError(err.message || 'Erreur lors du chargement des listes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            console.log('Creating new list:', newListName);
            const newList = await createList(newListName);
            console.log('New list created:', newList);
            setLists([...lists, newList]);
            setNewListName('');
        } catch (err) {
            console.error('Error creating list:', err);
            setError(err.message || 'Erreur lors de la création de la liste');
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
    if (error) return (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            <p className="font-semibold">Erreur :</p>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Mes Listes</h2>
            
            <form onSubmit={handleCreateList} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nouvelle liste..."
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Créer
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
                            className="flex items-center justify-between p-3 bg-white rounded shadow hover:shadow-md transition-shadow"
                        >
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => onSelectList(list)}
                            >
                                <h3 className="font-semibold">{list.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {list.movies_count} films
                                </p>
                            </div>
                            <button
                                onClick={() => setListToDelete(list)}
                                className="px-3 py-1 text-red-500 hover:text-red-700"
                            >
                                Supprimer
                            </button>
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