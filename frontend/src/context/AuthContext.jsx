import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get('/api/auth/me', config);
          setUser(data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.put('/api/auth/me', profileData, config);
      setUser(data);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        updateProfile,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
