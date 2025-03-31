import axiosInstance from './axiosConfig';

// Créer une nouvelle liste
export const createList = async (name, description = '') => {
    try {
        const response = await axiosInstance.post('/lists/', {
            name,
            description
        });
        return response.data;
    } catch (error) {
        console.error('Error creating list:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors de la création de la liste');
    }
};

// Récupérer toutes les listes de l'utilisateur
export const getLists = async () => {
    try {
        console.log('Fetching lists...');
        const response = await axiosInstance.get('/lists/');
        console.log('Lists received:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching lists:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors du chargement des listes');
    }
};

// Récupérer une liste spécifique avec ses films
export const getList = async (listId) => {
    try {
        const response = await axiosInstance.get(`/lists/${listId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching list:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors du chargement de la liste');
    }
};

// Mettre à jour une liste
export const updateList = async (listId, name, description = '') => {
    try {
        const response = await axiosInstance.put(`/lists/${listId}/`, {
            name,
            description
        });
        return response.data;
    } catch (error) {
        console.error('Error updating list:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour de la liste');
    }
};

// Supprimer une liste
export const deleteList = async (listId) => {
    try {
        await axiosInstance.delete(`/lists/${listId}/`);
        return true;
    } catch (error) {
        console.error('Error deleting list:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression de la liste');
    }
};

// Ajouter un film à une liste
export const addMovieToList = async (listId, movieId, note = '') => {
    try {
        console.log('Adding movie to list:', { listId, movieId, note });
        const response = await axiosInstance.post(`/lists/${listId}/add_movie/`, {
            movie_id: movieId,
            note
        });
        console.log('Movie added successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding movie to list:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           'Erreur lors de l\'ajout du film à la liste';
        throw new Error(errorMessage);
    }
};

// Retirer un film d'une liste
export const removeMovieFromList = async (listId, movieId) => {
    try {
        await axiosInstance.post(`/lists/${listId}/remove_movie/`, {
            movie_id: movieId
        });
        return true;
    } catch (error) {
        console.error('Error removing movie from list:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors du retrait du film de la liste');
    }
};

// Liker un film
export const likeMovie = async (movieId) => {
    try {
        const response = await axiosInstance.post(`/movies/${movieId}/like/`);
        return response.data;
    } catch (error) {
        console.error('Error liking movie:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors du like du film');
    }
};

// Marquer un film comme vu
export const markMovieAsViewed = async (movieId) => {
    try {
        const response = await axiosInstance.post(`/movies/${movieId}/view/`);
        return response.data;
    } catch (error) {
        console.error('Error marking movie as viewed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Erreur lors du marquage du film comme vu');
    }
}; 