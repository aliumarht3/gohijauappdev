import BankAccountModal from '@/components/molecules/BankAccountModal';
import { getBankNameByCode } from '@/constants/Banks';
import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import { useUser } from '../services/userService';
export default function WithdrawalScreen() {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [history, setHistory] = useState([
    { id: '1', date: '2025-08-01', amount: '50' },
    { id: '2', date: '2025-07-25', amount: '30' },
  ]);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  const { user, loading, loadingBank, bankAccount, hasBankAccount, refreshBank } = useUser();

  // Example: you’ll likely compute this from API instead of hardcoding
  const totalAmount = 200;

  useEffect(() => {
    console.log('Bank account changed:', bankAccount);
    console.log('Loading Bank:', loadingBank);
    console.log('Loading :', loading);
    if (!loading && !loadingBank && !hasBankAccount) {
      setBankModalVisible(true);
    }
  }, [loading, loadingBank, hasBankAccount, bankAccount]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawalAmount);

    if (!hasBankAccount) {
      setBankModalVisible(true);
      return;
    }

    if (isNaN(amount) || amount <= 1.0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than RM 1.00.');
      return;
    }
    if (amount > totalAmount) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to withdraw this amount.');
      return;
    }

    try {
      await api.post('/payout/customer', {
        amount,
      });
      setHistory([
        { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount: withdrawalAmount },
        ...history,
      ]);
      setWithdrawalAmount('');
      Alert.alert("Success", "Withdrawal request submitted.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to submit withdrawal.");
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
          title: 'Withdrawal',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: '#2E7D32',
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.total}>RM {totalAmount}</Text>

            {/* Show current bank info + change button */}
            {hasBankAccount ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: "#555" }}>Payout to:</Text>
                <Text style={{ color: "#2E7D32", fontWeight: "600", marginTop: 2 }}>{bankBadge}</Text>
                {/* <TouchableOpacity
                  onPress={() => setBankModalVisible(true)}
                  style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, marginTop: 8 }}
                >
                  <Text style={{ color: "#2E7D32", fontWeight: "600" }}>Change bank</Text>
                </TouchableOpacity> */}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setBankModalVisible(true)}
                style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#2E7D32", borderRadius: 8, marginTop: 8 }}
              >
                <Text style={{ color: "#2E7D32", fontWeight: "600" }}>Add bank account</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="card" style={styles.card}>
            <Text style={styles.label}>Withdrawal Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
            />
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!withdrawalAmount || parseFloat(withdrawalAmount) <= 1.0) && { backgroundColor: '#A5D6A7' }
              ]}
              onPress={handleWithdraw}
              disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 1.0}
            >
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.historyTitle}>Withdrawal History</Text>
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text>{item.date}</Text>
                  <Text style={styles.historyAmount}>RM {item.amount}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </SafeAreaView>

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
});
