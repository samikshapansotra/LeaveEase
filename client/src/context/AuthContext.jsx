import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { loginUser, registerUser, logoutUser, getCurrentUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getCurrentUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const profile = await loginUser(email, password);
    setUser(profile);
    return profile;
  };

  const register = async (userData) => {
    const profile = await registerUser(userData);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Re-fetch the user profile manually if needed (e.g., after timetable update)
  const fetchUser = async () => {
    if (auth.currentUser) {
      const profile = await getCurrentUserProfile(auth.currentUser.uid);
      setUser(profile);
      return profile;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
