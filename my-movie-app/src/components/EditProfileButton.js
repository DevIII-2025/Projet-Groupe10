import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EditProfileButton = () => {
    const { user, setUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.new_password !== formData.confirm_password) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8000/api/users/profile/', {
                username: formData.username,
                old_password: formData.old_password,
                new_password: formData.new_password
            });

            setUser({ ...user, username: formData.username });
            setSuccess('Profil mis à jour avec succès');
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess('');
                setFormData({
                    ...formData,
                    old_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }, 2000);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.detail || 'Erreur lors de la mise à jour du profil');
            } else {
                setError('Erreur de connexion au serveur');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
                Modifier profil
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Modifier mon profil</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                                <span className="block sm:inline">{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Nouveau nom d'utilisateur
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Mot de passe actuel
                                </label>
                                <input
                                    type="password"
                                    name="old_password"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={loading}
                            >
                                {loading ? 'Mise à jour...' : 'Mettre à jour'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditProfileButton; 