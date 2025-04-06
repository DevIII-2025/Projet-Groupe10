import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Le contenu principal sera affiché ici */}
    </div>
  );
}
