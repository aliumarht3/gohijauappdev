import TokenExpiredOverlay from '@/components/molecules/TokenExpiredOverlay';
import * as SignalR from '@microsoft/signalr';
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import CustomAlert from '../components/molecules/CustomAlert';
import CustomOverlay from '../components/molecules/StartPouringOverlay';

export default function QRCodeScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFinalizingVisible, setAlertFinalizingVisible] = useState(false);
  const [pouringVisible, setPouringVisible] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [expired, setExpired] = useState(false);
  const { signalRUrl } = Constants.expoConfig?.extra ?? {};
  useEffect(() => {
    console.log('Token in QRCodeScreen:', token);
    if (!token) return;

    setCountdown(180);
    setExpired(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token]);
  useEffect(() => {
    if (!token) return;

    const newConnection = new SignalR.HubConnectionBuilder()
      .withUrl(`${signalRUrl}/qrHub`) // ✅ Your SignalR hub endpoint
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("SignalR connected.");
        newConnection.invoke("JoinTokenGroup", token); // Join group for this token

        newConnection.on("TokenVerified", (data) => {
          if (data.token === token) {
            setAlertVisible(true);

          }
        });
        newConnection.on("Finalizing", (data) => {
          if (data.token === token) {
            setPouringVisible(false);
            setAlertFinalizingVisible(true);

          }
        });
        newConnection.on("PouringComplete", (data) => {
          setAlertFinalizingVisible(false); // Hide overlay
          router.push({
            pathname: '/FinalDataScreen',
            params: { oilPoured: data.oilAmount, pointsEarned: data.points },
          });
        });
        setConnection(newConnection);
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [token]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Show this QR code to the machine</Text>
      {!expired && (
        <Text style={styles.countdown}>
          Expires in: {formatTime(countdown)}
        </Text>
      )}
      <View style={styles.qrContainer}>
        <QRCode value={Array.isArray(token) ? token[0] : token ?? ''} size={200} />
      </View>
      <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        title="Authorized!"
        message="You can now lift the lid and start pouring."
        onClose={() => { setAlertVisible(false); setPouringVisible(true); }}
      />
      <TokenExpiredOverlay
        visible={expired}
        onRegenerate={() => {
          router.back();
        }}
      />
      <CustomOverlay visible={pouringVisible} text='Pouring in progress...' subtext='Please close the lid once done' />
      <CustomOverlay visible={alertFinalizingVisible} text='Finalizing. Please wait...' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f8f3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  cancelButton: {
    marginTop: 30,
  },
  cancelText: {
    color: '#388E3C',
    fontWeight: 'bold',
  },
  countdown: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
});
