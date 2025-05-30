import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

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

        if (formData.password !== formData.password2) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            const email = response.data.email;
            localStorage.setItem('verificationEmail', email);
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            //console.error('Erreur lors de l\'inscription:', err);
            if (err.response) {
                const errorData = err.response.data;
                let message = 'Une erreur est survenue lors de l\'inscription';
                if (typeof errorData === 'string') {
                    message = errorData;
                } else if (Array.isArray(errorData)) {
                    message = errorData.join(' ');
                } else if (typeof errorData === 'object' && errorData !== null) {
                    // Récupère tous les messages d'erreur de chaque champ
                    message = Object.entries(errorData)
                        .map(([field, val]) => {
                            if (Array.isArray(val)) {
                                return val.map(v => `${field}: ${v}`).join(' ');
                            } else {
                                return `${field}: ${val}`;
                            }
                        })
                        .join(' ');
                }
                setError(message);
            } else if (err.request) {
                setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
            } else {
                setError('Une erreur est survenue lors de l\'inscription');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col items-center mb-4">
                    <span className="text-4xl mb-1">🎬</span>
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-1">CritiQ</h1>
                    <h2 className="text-xl font-bold text-black mb-1">Créer un compte</h2>
                    <p className="text-gray-600 text-center mb-1 text-sm">Rejoignez-nous pour accéder à votre espace personnel</p>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative mb-3 text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Nom d'utilisateur"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-sm"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-sm"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="password2"
                            placeholder="Confirmer le mot de passe"
                            value={formData.password2}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? "Envoi du code..." : "S'inscrire"}
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-600">
                        Déjà un compte ?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Se connecter</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
