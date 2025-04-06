// src/api/authAPI.js
import axiosInstance from './axiosConfig';

// import React from 'react';
// import dotenv from 'dotenv';
// import { config } from 'dotenv';
// config({ path: '.env' });
// const BACKEND_URL = process.env.BACKEND_URL;

export const login = async (username, password) => {
  try {
    console.log('Attempting login...');
    const response = await axiosInstance.post('/users/login/', { 
      username, 
      password 
    });
    
    console.log('Login successful, storing tokens...');
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
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMe = async () => {
  try {
    console.log('Fetching user profile...');
    const response = await axiosInstance.get('/users/me/');
    console.log('User profile fetched successfully');
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    console.log('Attempting logout...');
    const response = await axiosInstance.post('/users/logout/');
    console.log('Logout successful, removing tokens...');
    // Supprimer les tokens
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    return response;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
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
