import React, { useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmailPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) return <p className="text-center text-red-600 mt-10">Erreur : aucun email fourni.</p>;

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Vérification de l'email
        </h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Un code de vérification a été envoyé à <b>{email}</b>
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Code de vérification
            </label>
            <input
              type="text"
              placeholder="Code reçu par email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Vérifier et créer le compte
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Retour à la{" "}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              connexion
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
