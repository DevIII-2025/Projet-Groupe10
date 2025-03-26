import { useAuth } from "../context/AuthContext";
import { logout } from "../api/authAPI";

export default function Home() {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
