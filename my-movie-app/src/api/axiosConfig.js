import axios from 'axios';

// Utiliser l'URL de l'environnement ou une URL par défaut
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
console.log("axiosConfig2: BACKEND_URL", BACKEND_URL);

const BASE_URL = BACKEND_URL;
const API_URL = `${BASE_URL}/api`;

console.log('Configuration API:', {
    BACKEND_URL,
    BASE_URL,
    API_URL
});

// Configuration de base pour toutes les instances axios
const defaultConfig = {
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

console.log('Default axios config:', defaultConfig);

const axiosInstance = axios.create(defaultConfig);

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use((config) => {
    // S'assurer que baseURL est toujours défini
    config.baseURL = API_URL;
    
    const token = localStorage.getItem('jwt_token');
    const finalUrl = config.baseURL + config.url;
    
    console.log('Making request to:', finalUrl, {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        withCredentials: config.withCredentials
    });
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Fonction pour rafraîchir le token
const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');
        
        // Créer une nouvelle instance avec la même configuration de base
        const tokenRefreshInstance = axios.create({
            ...defaultConfig,
            baseURL: API_URL // Forcer l'URL pour le refresh
        });
        
        const response = await tokenRefreshInstance.post('/users/token/refresh/', {
            refresh: refreshToken
        });

        console.log('Token refresh successful');
        
        const { access } = response.data;
        localStorage.setItem('jwt_token', access);
        return access;
    } catch (error) {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw error;
    }
};

// Intercepteur pour gérer les erreurs 401 et rafraîchir le token
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response successful:', {
            status: response.status,
            url: response.config.url
        });
        return response;
    },
    async (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            config: error.config
        });

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Attempting to retry request with new token...');
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                // S'assurer que l'URL est correcte pour la nouvelle tentative
                originalRequest.baseURL = API_URL;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Exporter la configuration et l'instance
export { API_URL, BASE_URL, defaultConfig };
export default axiosInstance; 