// src/api/authAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/users/",
  withCredentials: true, // IMPORTANT pour envoyer les cookies
});

// Fonction pour rafraîchir le token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('http://localhost:8000/api/users/token/refresh/', {
      refresh: refreshToken
    });

    const { access } = response.data;
    localStorage.setItem('jwt_token', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Si le refresh échoue, on déconnecte l'utilisateur
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw error;
  }
};

// Intercepteur pour gérer les erreurs 401 et rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas encore essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        // Mettre à jour le header Authorization avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  try {
    const response = await api.post("login/", { username, password });
    // Stocker les tokens
    if (response.data.access_token) {
      localStorage.setItem('jwt_token', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response;
  } catch (error) {
    console.error('Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
};

export const getMe = async () => {
  try {
    return await api.get("me/");
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("logout/");
    // Supprimer les tokens
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error.response?.data || error.message);
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('jwt_token') && !!localStorage.getItem('refresh_token');
};
