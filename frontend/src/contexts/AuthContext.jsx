import React, { createContext, useState, useContext, useEffect } from 'react';
import { axiosClient } from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les informations utilisateur
  const fetchUserData = async () => {
    try {
      if (token) {
        const response = await axiosClient.get('/api/user');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le token au chargement
  useEffect(() => {
    fetchUserData();
  }, [token]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/api/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    refreshUser: fetchUserData 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}