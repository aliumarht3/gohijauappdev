import authStorage from '@/api/authStorage';
import { LoadingScreen } from '@/components/molecules/loading';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { setAudioModeAsync } from 'expo-audio';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { LanguageProvider } from '../services/languageService';
import { UserProvider } from '../services/userService';
import { checkAppVersion } from "../utils/checkAppVersion";
import { UpdateRequiredScreen } from "../utils/UpdateRequiredScreen";
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
      
      // 1. Fetch the real token from your device storage
      const token = await authStorage.getAccessToken();
      
      // 2. Validate the token
      if (!token || isTokenExpired(token)) {
        await authStorage.clear();
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }

      // 3. Check onboarding status
      const seenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seenOnboarding === 'true' ? true : seenOnboarding === 'false' || seenOnboarding === null ? false : null);
      
      // 4. Mark auth check as complete so the loading screen drops
      setIsAuthChecked(true);
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
