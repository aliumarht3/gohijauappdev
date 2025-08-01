import LottieView from 'lottie-react-native';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface StartPouringOverlayProps {
  visible: boolean;
  text?: string;
}

export default function StartPouringOverlay({ visible,text }: StartPouringOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
           <LottieView
            source={require('../../assets/animations/Recycle.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  text: {
    marginTop: 15,
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '600',
  },
   animation: {
    width: 150,
    height: 150,
  },
});
