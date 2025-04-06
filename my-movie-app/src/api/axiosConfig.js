import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const BASE_URL = BACKEND_URL;
const API_URL = `${BASE_URL}/api`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
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

        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
            refresh: refreshToken
        }, {
            withCredentials: true
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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est 401 et qu'on n'a pas encore essayé de rafraîchir le token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { API_URL, BASE_URL };
export default axiosInstance; 