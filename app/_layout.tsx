import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { checkAppVersion } from "../utils/checkAppVersion";
import { UpdateRequiredScreen } from "../utils/UpdateRequiredScreen";

import { LoadingScreen } from '@/components/molecules/loading';
import { useColorScheme } from '@/hooks/useColorScheme';
import { setAudioModeAsync } from 'expo-audio';
import { jwtDecode } from 'jwt-decode';
import { LanguageProvider } from '../services/languageService';
import { UserProvider } from '../services/userService';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
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
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    }).catch((err) => {
      console.warn('Failed to set audio mode', err);
    });
  }, []);
  useEffect(() => {
    const checkAuth = async () => {
      const upToDate = await checkAppVersion();
      if (!upToDate) {
        setIsUpdateRequired(true);
        return;
      }
      
      // --- BYPASS LOGIN START ---
      console.log('Bypassing authentication for local testing...');
      setIsLoggedIn(true);
      setHasSeenOnboarding(true); 
      setIsAuthChecked(true);
      return; 
      // --- BYPASS LOGIN END ---

      // Comment out the real auth check for now
      /*
      const token = await authStorage.getAccessToken();
      if (!token || isTokenExpired(token)) {
        await authStorage.clear();
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }

      const seenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seenOnboarding === 'true' ? true : seenOnboarding === 'false' || seenOnboarding === null ? false : null);
      setIsAuthChecked(true);
      */
    };
    checkAuth();
  }, []);
  if (isUpdateRequired) {
    return (
      <LanguageProvider>
        <UpdateRequiredScreen />
      </LanguageProvider>
    );
  }

  // ✅ Optional: Show a temporary loading screen
  if (!isAuthChecked) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style='dark' />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
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
      </LanguageProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
