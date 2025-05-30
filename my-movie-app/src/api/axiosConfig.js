import axios from 'axios';

// Utiliser l'URL de l'environnement ou une URL par défaut
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const BASE_URL = BACKEND_URL;
const API_URL = `${BASE_URL}/api`;

// Configuration de base pour toutes les instances axios
const defaultConfig = {
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

const axiosInstance = axios.create(defaultConfig);

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use((config) => {
    // S'assurer que baseURL est toujours défini
    config.baseURL = API_URL;
    
    const token = localStorage.getItem('jwt_token');
    const finalUrl = config.baseURL + config.url;
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Fonction pour rafraîchir le token
const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // Créer une nouvelle instance avec la même configuration de base
        const tokenRefreshInstance = axios.create({
            ...defaultConfig,
            baseURL: API_URL // Forcer l'URL pour le refresh
        });
        
        const response = await tokenRefreshInstance.post('/users/token/refresh/', {
            refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('jwt_token', access);
        return access;
    } catch (error) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw error;
    }
};

// Intercepteur pour gérer les erreurs 401 et rafraîchir le token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/users/login/")
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.baseURL = API_URL;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Exporter la configuration et l'instance
export { API_URL, BASE_URL, defaultConfig };
export default axiosInstance; 

