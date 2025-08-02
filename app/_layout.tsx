import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { LoadingScreen } from '@/components/molecules/loading';
import { useColorScheme } from '@/hooks/useColorScheme';
import { jwtDecode } from 'jwt-decode';
import authStorage from '../api/authStorage';
import { UserProvider } from '../services/userService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();
  
  const isTokenExpired = (token: string): boolean => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authStorage.getAccessToken();
      if (!token || isTokenExpired(token)) {
        await authStorage.clear();
        // router.replace('/auth/login');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
      setIsAuthChecked(true);
    };
    checkAuth();
  }, []);

  // ✅ Optional: Show a temporary loading screen
  if (!isAuthChecked) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" />
        ): (
          <Stack.Screen name="auth" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      </UserProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Simple loading UI (optional)

