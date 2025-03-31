// src/api/authAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/users/",
  withCredentials: true, // IMPORTANT pour envoyer les cookies
});

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
    // Stocker le token JWT
    if (response.data.access_token) {
      localStorage.setItem('jwt_token', response.data.access_token);
      // Stocker aussi le refresh token si nécessaire
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
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
  return !!localStorage.getItem('jwt_token');
};
