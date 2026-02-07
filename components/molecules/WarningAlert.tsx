import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

type WarningAlertProps = {
    visible: boolean;
    title?: string;
    message?: string;
    onClose?: () => void;
    confirmText?: string;
    enableSound?: boolean;
    enableVibration?: boolean;
};

const WarningAlert: React.FC<WarningAlertProps> = ({
    visible,
    title = 'Warning',
    message = 'Something went wrong.',
    onClose,
    confirmText = 'OK',
    enableSound = true,
    enableVibration = true,
}) => {
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        // Load sound on mount
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/sounds/Siren.mp3'),
                    { shouldPlay: false, isLooping: true }
                );
                soundRef.current = sound;
            } catch (error) {
                console.error('Error loading sound:', error);
            }
        };

        loadSound();

        // Cleanup on unmount
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        const pattern = [0, 600, 400]; // vibrate pattern

        const handleVisibilityChange = async () => {
            if (visible) {
                if (enableVibration) {
                    Vibration.vibrate(pattern, true); // repeat = true
                }
                if (enableSound && soundRef.current) {
                    try {
                        await soundRef.current.setPositionAsync(0);
                        await soundRef.current.playAsync();
                    } catch (error) {
                        console.error('Error playing sound:', error);
                    }
                }
            } else {
                // stop everything when modal hides
                Vibration.cancel();
                if (soundRef.current) {
                    try {
                        await soundRef.current.stopAsync();
                        await soundRef.current.setPositionAsync(0);
                    } catch (error) {
                        console.error('Error stopping sound:', error);
                    }
                }
            }
        };

        handleVisibilityChange();

        // cleanup
        return () => {
            Vibration.cancel();
        };
    }, [visible, enableSound, enableVibration]);

    const handleClose = () => {
        onClose?.(); // parent should set visible=false
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <LottieView
                        source={require('../../assets/animations/Warning.json')}
                        autoPlay
                        loop
                        style={styles.lottie}
                    />

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity style={styles.button} onPress={handleClose}>
                        <Text style={styles.buttonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WarningAlert;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    lottie: {
        width: 140,
        height: 140,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        color: '#555',
    },
    button: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#f97316',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});