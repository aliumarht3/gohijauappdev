import { useRouter } from 'expo-router';
import React from 'react';
import { useLanguage } from '../services/languageService';
import { Image, StyleSheet } from 'react-native';
import GetStarted from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GetStartedScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  const completeGetStarted = async () => {
    // await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)'); // Go to tabs after onboarding
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <GetStarted
        onSkip={completeGetStarted}
        onDone={completeGetStarted}
        pages={[
          {
            backgroundColor: '#4CAF50',
            image: <Image source={require('../assets/help/scan.png')} style={styles.image} />,
            title: t.getStarted.selectQRTitle,
            subtitle: t.getStarted.selectQRSubtitle,
          },
          {
            backgroundColor: '#FF9800',
            image: <Image source={require('../assets/help/qr.png')} style={styles.image} />,
            title: t.getStarted.scanQRTitle,
            subtitle: t.getStarted.scanQRSubtitle,
          },
          {
            backgroundColor: '#2196F3',
            image: <Image source={require('../assets/help/authorized.png')} style={styles.image} />,
            title: t.getStarted.authorizationTitle,
            subtitle: t.getStarted.authorizationSubtitle,
          },
          {
            backgroundColor: '#2642dfff',
            image: <Image source={require('../assets/help/pouring.png')} style={styles.image} />,
            title: t.getStarted.pouredOilTitle,
            subtitle: t.getStarted.pouredOilSubtitle,
          },
          {
            backgroundColor: '#9cc211ff',
            image: <Image source={require('../assets/help/completed.png')} style={styles.image} />,
            title: t.getStarted.completedTitle,
            subtitle: t.getStarted.completedSubtitle,
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});