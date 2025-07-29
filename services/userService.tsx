import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      const res = await fetch('http://10.0.2.2:7192/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch user');

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    }
  };

  const loginUser = async (email: string, password: string) => {
      let url = 'http://10.0.2.2:7192/api/auth/login';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid credentials');
        }
        throw new Error(`Login failed (Status ${response.status})`);
      }

      const data = await response.json();
      // Store token
      await AsyncStorage.setItem('auth_token', data.token);
      loadUserProfile();
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, loadUserProfile, loginUser }}>
      {children}
    </UserContext.Provider>
  );
};