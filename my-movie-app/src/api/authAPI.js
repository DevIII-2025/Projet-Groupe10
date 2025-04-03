// src/api/authAPI.js
import axios from "axios";
import axiosInstance, { API_URL } from './axiosConfig';

// import React from 'react';
// import dotenv from 'dotenv';
// import { config } from 'dotenv';
// config({ path: '.env' });
// const BACKEND_URL = process.env.BACKEND_URL;

const BACKEND_URL = 'http://localhost:8000';

const AUTH_URL = BACKEND_URL + '/api/users';

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

export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/users/login/', { 
      username, 
      password 
    });
    
    // Stocker les tokens
    const { access_token, refresh_token } = response.data;
    if (access_token) {
      localStorage.setItem('jwt_token', access_token);
    }
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    return response;
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/users/me/');
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post('/users/logout/');
    // Supprimer les tokens
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    return response;
  } catch (error) {
    console.error('Error during logout:', error.response?.data || error.message);
    // Même en cas d'erreur, on supprime les tokens
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('jwt_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return !!token && !!refreshToken;
};
