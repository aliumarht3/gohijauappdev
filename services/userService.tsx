import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/apiClient';
import authStorage from '../api/authStorage';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const loadUserProfile = async () => {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        setUser(null);
        await justLogout();
        return Promise.reject(new Error("Token Expired"));
      }
      const res = await api.get('/user/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Error loading user:', error);
      await justLogout();
      setUser(null);
    }
  };

  const justLogout = async () => {
    await authStorage.clear();
    router.dismissAll();
    router.replace('/auth/login');
  };

    const loginUser = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, refreshToken } = response.data;

      // WILL BE REMOVED SOON
      // const token = accessToken;
      // const decoded = jwtDecode<{ exp: number; [key: string]: any }>(token);
      // const expiresAt = new Date(decoded.exp * 1000);

      await authStorage.setAccessToken(accessToken);
      await authStorage.setRefreshToken(refreshToken);
      loadUserProfile();
      return true;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, loadUserProfile, loginUser, justLogout }}>
      {children}
    </UserContext.Provider>
  );
};