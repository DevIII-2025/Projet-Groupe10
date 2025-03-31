import React, { useState, useEffect } from 'react';
import { getLists, createList, deleteList } from '../api/listAPI';

const Lists = ({ onSelectList }) => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleDeleteList = async (listId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) return;

        try {
            console.log('Deleting list:', listId);
            await deleteList(listId);
            console.log('List deleted successfully');
            setLists(lists.filter(list => list.id !== listId));
        } catch (err) {
            console.error('Error deleting list:', err);
            setError(err.message || 'Erreur lors de la suppression de la liste');
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
                                onClick={() => handleDeleteList(list.id)}
                                className="px-3 py-1 text-red-500 hover:text-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Lists; 