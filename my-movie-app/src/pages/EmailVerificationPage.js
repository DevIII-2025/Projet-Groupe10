import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerificationPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem('verificationEmail');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        } else {
            localStorage.setItem('verificationEmail', email);
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleCodeChange = (index, value) => {
        if (value.length > 1) return; // Empêcher plus d'un caractère
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus sur le champ suivant
        if (value && index < 5) {
            const nextInput = document.querySelector(`input[name="code-${index + 1}"]`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            // Focus sur le champ précédent lors de la suppression
            const prevInput = document.querySelector(`input[name="code-${index - 1}"]`);
            if (prevInput) {
                prevInput.focus();
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const verificationCode = code.join('');
            const response = await axios.post('http://localhost:8000/api/users/verify-email/', {
                email,
                code: verificationCode
            });

            setSuccess(true);
            localStorage.removeItem('verificationEmail');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Code de vérification invalide');
            setCode(['', '', '', '', '', '']);
            // Focus sur le premier champ après une erreur
            document.querySelector('input[name="code-0"]')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setResendDisabled(true);
        setCountdown(60); // 60 secondes avant de pouvoir renvoyer

        try {
            await axios.post('http://localhost:8000/api/users/resend-verification/', { email });
            setError('');
        } catch (err) {
            setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Vérification de votre email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Nous avons envoyé un code à {email}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {success ? (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Email vérifié avec succès ! Redirection...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Code de vérification
                                </label>
                                <div className="mt-1 flex justify-between">
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            name={`code-${index}`}
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || code.some(digit => !digit)}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        loading || code.some(digit => !digit)
                                            ? 'bg-indigo-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                                >
                                    {loading ? 'Vérification...' : 'Vérifier'}
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendDisabled}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                                >
                                    {countdown > 0
                                        ? `Renvoyer le code (${countdown}s)`
                                        : "Renvoyer le code"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage; 