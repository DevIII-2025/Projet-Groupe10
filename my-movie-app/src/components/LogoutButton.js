import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/authAPI';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null); // Réinitialiser l'état utilisateur dans le contexte
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, on force quand même la déconnexion côté client
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
    >
      Se déconnecter
    </button>
  );
};

export default LogoutButton; 