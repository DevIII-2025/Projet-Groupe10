import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState('');
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
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/users/register/', formData);
            navigate('/login');
        } catch (err) {
            if (err.response) {
                // Le serveur a répondu avec un statut d'erreur
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    // Si l'erreur est un objet, afficher le premier message d'erreur
                    const firstError = Object.values(errorData)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setError('Une erreur est survenue lors de l\'inscription');
                }
            } else if (err.request) {
                // La requête a été faite mais aucune réponse n'a été reçue
                setError('Impossible de contacter le serveur');
            } else {
                // Une erreur s'est produite lors de la configuration de la requête
                setError('Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Créer un compte
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Nom d'utilisateur"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            name="password2"
                            placeholder="Confirmer le mot de passe"
                            value={formData.password2}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Déjà un compte ?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;