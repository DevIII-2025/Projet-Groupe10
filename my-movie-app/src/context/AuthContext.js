import { createContext, useContext, useEffect, useState } from "react";
import { getMe, isAuthenticated } from "../api/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (isAuthenticated()) {
        const res = await getMe();
        setUser({
          ...res.data,
          is_staff: res.data.is_staff || false
        });

      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
