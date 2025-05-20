import { useState } from "react";
import { login, getMe } from "../api/authAPI";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const loginResponse = await login(username, password);
    const userResponse = await getMe();

    setUser(userResponse.data);

    toast.success("Connexion réussie !");
    // ✅ Attendre 2 secondes pour laisser le toast s'afficher
    await new Promise(resolve => setTimeout(resolve, 2000));

    navigate("/");

    } catch (err) {
      console.error("Erreur complète:", err);
      if (err.response) {
        toast.error(err.response.data.detail || "Échec de la connexion. Vérifiez vos identifiants.");
      } else if (err.request) {
        toast.error("Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        toast.error("Une erreur est survenue lors de la tentative de connexion.");
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mot de passe
            </label>
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
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
