import BankAccountModal from '@/components/molecules/BankAccountModal';
import WithdrawalOverlay from '@/components/molecules/WithdrawalOverlay';
import { getBankNameByCode } from '@/constants/Banks';
import { Colors } from '@/constants/Colors';
import * as SignalR from "@microsoft/signalr";
import Constants from "expo-constants";
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import authStorage from "../api/authStorage";
import { getTotalTransaction } from '../services/transactionService';
import { useLanguage } from '../services/languageService';
import { useUser } from '../services/userService';

export default function WithdrawalScreen() {
  const { t } = useLanguage();
  const { signalRUrl } = Constants.expoConfig?.extra ?? {};
  const [pointsAwarded, setPointsAwarded] = React.useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [history, setHistory] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const { user, loadUserProfile, loadingBank, bankAccount, hasBankAccount, refreshBank } = useUser();

  // Example: you'll likely compute this from API instead of hardcoding
  const totalAmount = 200;
  type ApiWithdrawal = {
    id: string;
    amount: number | string;
    status: string;
    createdAt: string;
  };

  type WithdrawalItem = {
    id: string;
    date: string;
    amount: string;
    status: "PENDING" | "SUCCESS" | "DECLINED";
  };
  const normalizeStatus = (s: string): WithdrawalItem["status"] => {
    const val = (s || "").trim().toUpperCase();
    if (["IN PROGRESS", "PENDING"].includes(val)) return "PENDING";
    if (["COMPLETE", "COMPLETED", "SUCCESS"].includes(val)) return "SUCCESS";
    if (["DECLINED", "REJECTED", "FAILED"].includes(val)) return "DECLINED";
    return "PENDING";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const mapApiToUi = (rows: ApiWithdrawal[]): WithdrawalItem[] =>
    (rows || [])
      .map(r => ({
        id: r.id,
        date: formatDate(r.createdAt),
        amount: Number(r.amount ?? 0).toFixed(2),
        status: normalizeStatus(r.status),
      }))
      // newest first
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  const statusLabel: Record<WithdrawalItem["status"], string> = {
    PENDING: t.withdrawal.statusPending,
    SUCCESS: t.withdrawal.statusSuccess,
    DECLINED: t.withdrawal.statusDeclined,
  };

  function StatusBadge({ status }: { status: WithdrawalItem["status"] }) {
    const bg =
      status === "SUCCESS" ? "#DCFCE7" : status === "DECLINED" ? "#FEE2E2" : "#F3F4F6";
    const color =
      status === "SUCCESS" ? "#166534" : status === "DECLINED" ? "#991B1B" : "#374151";
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{statusLabel[status]}</Text>
      </View>
    );
  }
  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<ApiWithdrawal[]>("/customer/get-withdrawal-history");
      const result = await getTotalTransaction();
      if (result == null) { setPointsAwarded(0); } else { setPointsAwarded(result.pointsAwarded); }

      setHistory(mapApiToUi(res.data));
    } catch (e: any) {
      setError(e?.message || "Failed to load withdrawal history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProfile();
    await load();
    setRefreshing(false);
  }, [load]);
  useEffect(() => {
    let isMounted = true;
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${signalRUrl}/withdrawalHub`, {
        accessTokenFactory: async () => (await authStorage.getAccessToken()) ?? ""
      })
      .withAutomaticReconnect()
      .build();

    connection.on("WithdrawalChanged", (payload: any) => {
      load();
    });

    (async () => {
      try {
        await connection.start();

      } catch (e) {
        console.warn("Hub connect failed", e);
      }
    })();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [load]);
  useEffect(() => {
    if (!loadingBank && !hasBankAccount) {
      setBankModalVisible(true);
    }
  }, [loadingBank, hasBankAccount, bankAccount]);

  useEffect(() => {
    const fetchData = async () => {
      await loadUserProfile();
      await load();
    };

    fetchData();
  }, [load]);
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawalAmount);

    if (!hasBankAccount) {
      setBankModalVisible(true);
      return;
    }

    if (isNaN(amount) || amount <= 1.0) {
      Alert.alert(t.withdrawal.invalidAmount, t.withdrawal.invalidAmountMessage);
      return;
    }
    if (amount > totalAmount) {
      Alert.alert(t.withdrawal.insufficientBalance, t.withdrawal.insufficientBalanceMessage);
      return;
    }

    try {
      setWithdrawing(true);
      await api.post('/payout/customer', {
        amount,
      });
      load();
      setWithdrawing(false);
      setWithdrawalAmount('');
      Alert.alert(t.common.success, t.withdrawal.withdrawalSubmitted);
    } catch (e: any) {
      setWithdrawing(false);
      Alert.alert(t.common.error, e?.response?.data?.error ?? t.withdrawal.withdrawalFailed);
    }
  };

  const bankBadge = useMemo(() => {
    if (!hasBankAccount) return null;
    return `(${getBankNameByCode(bankAccount.bankCode) ?? bankAccount.bankCode}) • ${bankAccount.accountNumber}`;
  }, [bankAccount, hasBankAccount]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t.withdrawal.title,
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: '#2E7D32',
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.label}>{t.withdrawal.totalAmount}</Text>
            <Text style={styles.total}>RM {pointsAwarded}</Text>

            {/* Show current bank info + change button */}
            {hasBankAccount ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: "#555" }}>{t.withdrawal.payoutTo}</Text>
                <Text style={{ color: "#2E7D32", fontWeight: "600", marginTop: 2 }}>{bankBadge}</Text>
                <TouchableOpacity
                  onPress={() => setBankModalVisible(true)}
                  style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, marginTop: 8 }}
                >
                  <Text style={{ color: "#2E7D32", fontWeight: "600" }}>{t.withdrawal.changeBank}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setBankModalVisible(true)}
                style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, marginTop: 8 }}
              >
                <Text style={{ color: "#2E7D32", fontWeight: "600" }}>{t.withdrawal.addBankAccount}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="card" style={styles.card}>
            <Text style={styles.label}>{t.withdrawal.withdrawalAmount}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder={t.withdrawal.enterAmount}
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
            />
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!withdrawalAmount || parseFloat(withdrawalAmount) < 1.0) && { backgroundColor: '#A5D6A7' }
              ]}
              onPress={handleWithdraw}
              disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 1.0}
            >
              <Text style={styles.withdrawButtonText}>{t.withdrawal.withdrawButton}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.historyTitle}>{t.withdrawal.withdrawalHistory}</Text>
            <FlatList
              style={{ flex: 1 }}                    // ← give the list height
              data={history}
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={<Text style={styles.empty}>{t.withdrawal.noWithdrawals}</Text>}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{item.date}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={styles.amount}>RM {item.amount}</Text>
                </View>
              )}
              showsVerticalScrollIndicator
            />
          </View>
        </View>
      </SafeAreaView>
      <WithdrawalOverlay visible={withdrawing} text={t.withdrawal.processingWithdrawal} subtext={t.withdrawal.processingSubtext} />
      <BankAccountModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        onSaved={refreshBank}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F9F4' },
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  label: { fontSize: 16, fontWeight: '600', color: '#2E7D32' },
  total: { fontSize: 24, fontWeight: '700', color: '#2E7D32', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 },
  withdrawButton: { backgroundColor: '#2E7D32', borderRadius: 8, marginTop: 12, padding: 12, alignItems: 'center' },
  withdrawButtonText: { color: '#fff', fontWeight: '600' },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#2E7D32', marginBottom: 8 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyAmount: { color: '#2E7D32', fontWeight: '600' },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginTop: 4 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  date: { fontSize: 14, color: "#374151" },
  amount: { fontWeight: "700", fontSize: 16 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },
});
