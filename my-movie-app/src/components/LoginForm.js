import { useState } from "react";
import { login, getMe } from "../api/authAPI";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Tentative de connexion avec:", username);
      const loginResponse = await login(username, password);
      console.log("Réponse de login:", loginResponse.data);

      const userResponse = await getMe();
      console.log("Réponse de getMe:", userResponse.data);

      setUser(userResponse.data);
      navigate("/");
    } catch (err) {
      console.error("Erreur complète:", err);
      if (err.response) {
        // Le serveur a répondu avec un statut d'erreur
        setError(err.response.data.detail || "Échec de la connexion. Vérifiez vos identifiants.");
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError("Une erreur est survenue lors de la tentative de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Connexion
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nom d'utilisateur ou Email
            </label>
            <input
              type="text"
              placeholder="Username ou Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
