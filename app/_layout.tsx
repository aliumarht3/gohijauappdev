import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { LoadingScreen } from '@/components/molecules/loading';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import authStorage from '../api/authStorage';
import { UserProvider } from '../services/userService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
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
      console.log('Access Token:', token);
      if (!token || isTokenExpired(token)) {
        await authStorage.clear();
        // router.replace('/auth/login');
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
         const seenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      console.log('Has seen onboarding:', seenOnboarding);
      setHasSeenOnboarding(seenOnboarding === 'true' ? true : seenOnboarding === 'false' || seenOnboarding === null ? false : null);
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
            !hasSeenOnboarding ? (
              <Stack.Screen name="OnboardingScreen" />
            ) : (
              <Stack.Screen name="(tabs)" />
            )
          ) : (
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

