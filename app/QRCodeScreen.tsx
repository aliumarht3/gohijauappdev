import WarningAlert from '@/components/molecules/WarningAlert';
import * as SignalR from '@microsoft/signalr';
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '../api/apiClient';
import CustomAlert, { AlertButton } from '../components/molecules/CustomAlert';
import CustomOverlay from '../components/molecules/StartPouringOverlay';
import { interpolate } from '../constants/languages';
import { useLanguage } from '../services/languageService';
export default function QRCodeScreen() {
  const { t } = useLanguage();
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertCollectorVisible, setAlertCollectorVisible] = useState(false);
  const [alertFinalizingVisible, setAlertFinalizingVisible] = useState(false);
  const [pouringVisible, setPouringVisible] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [expired, setExpired] = useState(false);
  const [overload, setOverload] = useState(false);
  const [machineId, setMachineId] = useState('');
  const [collectorUCOWeight, setcollectorUCOWeight] = useState('');
  const { signalRUrl } = Constants.expoConfig?.extra ?? {};
  const handleBack = () => {
    setExpired(false);
    setCountdown(0);
    router.back();
  };
  const getMachineId = async () => {
    try {
      let result = await api.post('/qr/getMachineId', { token });
      if (result.data.success) {
        setMachineId(result.data.success);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch machine ID:', error);
    }
  }
  useEffect(() => {
    if (!token) return;

    let timer: NodeJS.Timeout;

    setCountdown(180);
    setExpired(false);

    timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ✅ Cleanup when component unmounts
    return () => {
      clearInterval(timer);
    };
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
            // setExpired(false); // Mark token as expired
            // setCountdown(0); // Stop countdown
            setAlertVisible(true);

          }
        });
        newConnection.on("TokenVerifiedCollector", async (data) => {
          if (data.token === token) {
            setAlertCollectorVisible(true);
            console.log("Fetching machine ID for collector...", token);
            await getMachineId();
          }
        });
        newConnection.on("Finalizing", (data) => {
          if (data.token === token) {
            setPouringVisible(false);
            setAlertFinalizingVisible(true);

          }
        });
        newConnection.on("PouringComplete", (data) => {
          setOverload(false);
          setAlertFinalizingVisible(false); // Hide overlay
          router.push({
            pathname: '/FinalDataScreen',
            params: { oilPoured: data.oilAmount, pointsEarned: data.points },
          });
        });
        newConnection.on("CollectionComplete", (data) => {
          setAlertFinalizingVisible(false); // Hide overlay
          router.push({
            pathname: '/FinalDataScreen',
            params: { oilPoured: data.oilAmount },
          });
        });
        newConnection.on("TokenExpired", (data) => {
          // setExpired(true); // Mark token as expired
          setCountdown(0);
        });

        newConnection.on("Overflow", (data) => {
          if (data.token === token) {
            setPouringVisible(false);
            setOverload(true);
          }
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
  const handleEndCollection = async (collectorUCO: string) => {
    try {
      const connectionMachine = new SignalR.HubConnectionBuilder()
        .withUrl(`${signalRUrl}/machineHub`)
        .withAutomaticReconnect()
        .build();

      const formData = new FormData();
      formData.append('ucoWeight', collectorUCO);

      await api.post('/collector/record-uco-weight', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await connectionMachine.start();
      console.log("✅ SignalR connected.MachineHUb for end Collection");

      // Send the CollectorEnd command
      await connectionMachine.invoke("SendCommand", machineId, "CollectorEnd");
      console.log("📤 Sent CollectorEnd command to machine", machineId);

      await connectionMachine.stop();
      console.log("🛑 SignalR connection stopped.");
    } catch (error) {
      console.error("❌ SignalR send failed:", error);
    }
  }
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  const handleSubmitEndCollection = async () => {
    if (!collectorUCOWeight || collectorUCOWeight.trim() === '') {
      Alert.alert(t.qrCode.inputRequired, t.qrCode.inputRequiredMessage);
      return;
    }
    setAlertCollectorVisible(false);
    await handleEndCollection(collectorUCOWeight);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{t.qrCode.instruction}</Text>
      {!expired && (
        <Text style={styles.countdown}>
          {interpolate(t.qrCode.expiresIn, { time: formatTime(countdown) })}
        </Text>
      )}
      <View style={styles.qrContainer}>
        <QRCode value={Array.isArray(token) ? token[0] : token ?? ''} size={200} />
      </View>
      <TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
        <Text style={styles.cancelText}>{t.qrCode.cancelButton}</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        title={t.qrCode.authorized}
        message={t.qrCode.authorizedPouringMessage}
        onClose={() => { setAlertVisible(false); setPouringVisible(true); }}
      />
      <CustomAlert
        visible={alertCollectorVisible}
        title={t.qrCode.authorized}
        renderContent={() => (
          <>
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 10 }}>
              {t.qrCode.authorizedCollectorMessage}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 10,
                marginTop: 5,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  paddingVertical: 10,
                }}
                placeholder={t.qrCode.enterUCOWeight}
                keyboardType="numeric"
                value={collectorUCOWeight}
                onChangeText={setcollectorUCOWeight}
              />
              <Text style={{ fontSize: 16, marginLeft: 5 }}>{t.common.kg}</Text>

            </View>
            <AlertButton
              label={t.qrCode.endCollection}
              color="#4CAF50"
              onPress={handleSubmitEndCollection}
            />
          </>
        )}
      />
      <WarningAlert
        visible={overload}
        title={t.qrCode.limitReached}
        message={t.qrCode.limitReachedMessage}
        enableSound={true}
        enableVibration={true}
        onClose={() => { setOverload(false); setAlertFinalizingVisible(true); }} />
      <CustomOverlay visible={pouringVisible} text={t.qrCode.inProgress} subtext={t.qrCode.closeLidMessage} />
      <CustomOverlay visible={alertFinalizingVisible} text={t.qrCode.finalizing} />
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
