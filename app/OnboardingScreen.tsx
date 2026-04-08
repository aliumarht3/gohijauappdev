import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { useLanguage } from '../services/languageService';
import { Image, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)'); // Go to tabs after onboarding
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Onboarding
        onSkip={completeOnboarding}
        onDone={completeOnboarding}
        pages={[
          {
            backgroundColor: '#4CAF50',
            image: <Image source={require('../assets/help/qr.png')} style={styles.image} />,
            title: t.onboarding.scanTitle,
            subtitle: t.onboarding.scanSubtitle,
          },
          {
            backgroundColor: '#FF9800',
            image: <Image source={require('../assets/help/withdrawal.png')} style={styles.image} />,
            title: t.onboarding.trackRewardsTitle,
            subtitle: t.onboarding.trackRewardsSubtitle,
          },
          {
            backgroundColor: '#2196F3',
            image: <Image source={require('../assets/help/map.png')} style={styles.image} />,
            title: t.onboarding.findPointsTitle,
            subtitle: t.onboarding.findPointsSubtitle,
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

