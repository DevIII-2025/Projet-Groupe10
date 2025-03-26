import { useState } from "react";
import { login } from "../api/authAPI";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      const res = await fetch("http://localhost:8000/api/users/me/", {
        credentials: "include",
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      alert("Échec de la connexion 😢");
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
            <label className="block mb-1 text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Se connecter
          </button>
        </form>
      </div>
      <p className="mt-6 text-gray-500 text-sm">Accès réservé aux utilisateurs enregistrés 🔒</p>
    </div>
  );
}
