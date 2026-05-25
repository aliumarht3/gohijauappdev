import CustomTabBar, { TAB_BAR_FAB_OVERFLOW, TAB_BAR_ROW_HEIGHT } from '@/components/CustomTabBar';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../services/languageService';

export default function TabLayout() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_ROW_HEIGHT + TAB_BAR_FAB_OVERFLOW + insets.bottom;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    }).catch((err) => {
      console.warn('Failed to set audio mode', err);
    });
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.75)',
        tabBarStyle: {
          position: 'absolute',
          height: tabBarHeight,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
