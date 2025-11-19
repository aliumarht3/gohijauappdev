import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function TabLayout() {
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    }).catch((err) => {
      console.warn('Failed to set audio mode', err);
    });
  }, []);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32', // ✅ Green active icon
        tabBarInactiveTintColor: '#A0A0A0', // ✅ Gray inactive icon
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#F2F8F3', // ✅ Matches app theme
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          height: Platform.OS === 'ios' ? 30 + insets.bottom : 40 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

