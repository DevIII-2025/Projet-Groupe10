import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmailVerification = ({ email, onVerificationSuccess }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/users/verify-email/', {
                email,
                code
            });

            onVerificationSuccess();
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/users/resend-verification/', { email });
            setError('Un nouveau code a été envoyé à votre email');
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Vérification Email</h2>
            <p className="mb-4 text-gray-600 text-center">
                Un code de vérification a été envoyé à {email}
            </p>

            <form onSubmit={handleVerification} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Code de vérification
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength="6"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Entrez le code à 6 chiffres"
                        required
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    Vérifier
                </button>

                <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="w-full mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                    Renvoyer le code
                </button>
            </form>
        </div>
    );
};

export default EmailVerification; 