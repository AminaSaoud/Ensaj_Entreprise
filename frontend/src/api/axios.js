// api/axios.js
import axios from "axios";

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour ajouter automatiquement le token d'authentification
axiosClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

//intercepteur pour gérer les réponses et les erreurs
axiosClient.interceptors.response.use(
    response => response,
    error => {
        // Gestion des erreurs 401 (token expiré/invalide)
        if (error.response && error.response.status === 401) {
            // Nettoyer le localStorage si nécessaire
            localStorage.removeItem('token');
            
        }
        return Promise.reject(error);
    }
);