import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
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
    const player = useAudioPlayer(require('../../assets/sounds/Siren.mp3'));
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        const pattern = [0, 600, 400]; // vibrate pattern

        if (visible) {
            if (enableVibration) {
                Vibration.vibrate(pattern, true); // repeat = true
            }
            if (enableSound) {
                // start from beginning every time it opens
                player.seekTo(0);
                player.play();
            }
        } else {
            // stop everything when modal hides
            Vibration.cancel();
            player.pause();
            player.seekTo(0);
        }

        // extra cleanup if component unmounts
        return () => {
            Vibration.cancel();
            player.pause();
            player.seekTo(0);
        };
    }, [visible, enableSound, enableVibration, player]);

    useEffect(() => {
        if (!visible || !enableSound) return;
        if (!status) return;

        const { playing, currentTime, duration } = status;

        if (
            duration > 0 &&
            !playing &&
            currentTime >= duration - 0.1 // near end
        ) {
            player.seekTo(0);
            player.play();
        }
    }, [status, visible, enableSound, player]);

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
                        source={require('../../assets/animations/Warning.json')} // put your Lottie JSON here
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
        backgroundColor: '#f97316', // orange-ish warning feel
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
