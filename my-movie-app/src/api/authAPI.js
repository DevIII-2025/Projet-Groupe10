// src/api/authAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/users/",
  withCredentials: true, // IMPORTANT pour envoyer les cookies
});

export const login = async (username, password) => {
  return await api.post("login/", { username, password });
};

export const getMe = async () => {
  return await api.get("me/");
};

export const logout = async () => {
  return await api.post("logout/");
};
