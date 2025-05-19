// src/pages/VerifyEmailPage.js
import React, { useState } from "react";
import axiosInstance from '../api/axiosConfig';
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmailPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) return <p>Erreur : aucun email fourni.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axiosInstance.post("/users/verify-email/", { email, code });
      navigate("/login");
    } catch (err) {
      setError("Code invalide ou expiré.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Vérification de l'email</h2>
      <p>Un code de vérification a été envoyé à <b>{email}</b></p>
      <input
        type="text"
        placeholder="Code de vérification"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Vérifier et créer le compte</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default VerifyEmailPage;
