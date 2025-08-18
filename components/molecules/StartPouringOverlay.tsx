import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

interface StartPouringOverlayProps {
  visible: boolean;
  text?: string;
  subtext?: string;
}

export default function StartPouringOverlay({ visible, text, subtext }: StartPouringOverlayProps) {
  const [showModal, setShowModal] = useState(visible);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false); // Unmount after fade-out
      });
    }
  }, [visible]);

  if (!showModal) return null; // Fully unmounted

  return (
    <Modal transparent animationType="none" visible={showModal}>
      <Animated.View style={[styles.overlay, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
        <View style={styles.container}>
          <LottieView
            source={require('../../assets/animations/Recycle.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          {text ? <Text style={styles.text}>{text}</Text> : null}
          {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  animation: {
    width: 150,
    height: 150,
  },
  text: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    color: '#f30909ff',
  },
});
