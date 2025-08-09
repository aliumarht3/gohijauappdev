import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import GetStarted from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
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
            title: 'Select To Generate QR Code',
            subtitle: 'Scan QR code to start recycling used oil. Quick and easy!',
          },
          {
            backgroundColor: '#FF9800',
            image: <Image source={require('../assets/help/qr.png')} style={styles.image} />,
            title: 'Scan QR Code',
            subtitle: 'Show the QR code to the machine for verification.',
          },
          {
            backgroundColor: '#2196F3',
            image: <Image source={require('../assets/help/authorized.png')} style={styles.image} />,
            title: 'Authorization',
            subtitle: 'Once authorized, lift the lid and start pouring.',
          },
          {
            backgroundColor: '#2642dfff',
            image: <Image source={require('../assets/help/pouring.png')} style={styles.image} />,
            title: 'Poured Oil?',
            subtitle: 'Close the lid after pouring. We will process it.',
          },
          {
            backgroundColor: '#9cc211ff',
            image: <Image source={require('../assets/help/completed.png')} style={styles.image} />,
            title: 'Completed',
            subtitle: 'Your oil has been processed. Check your points and rewards.',
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