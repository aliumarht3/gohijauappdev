import BankAccountModal from '@/components/molecules/BankAccountModal';
import WithdrawalOverlay from '@/components/molecules/WithdrawalOverlay';
import { DashboardTheme } from '@/constants/dashboardTheme';
import { getBankNameByCode } from '@/constants/Banks';
import { interpolate } from '@/constants/languages';
import { Ionicons } from '@expo/vector-icons';
import * as SignalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/apiClient';
import authStorage from '../api/authStorage';
import { getTotalTransaction } from '../services/transactionService';
import { useLanguage } from '../services/languageService';
import { useUser } from '../services/userService';

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
  status: 'PENDING' | 'SUCCESS' | 'DECLINED';
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 2,
  borderColor: DashboardTheme.borderLight,
  padding: 16,
};

export default function WithdrawalScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { signalRUrl } = Constants.expoConfig?.extra ?? {};
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [history, setHistory] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const { loadUserProfile, loadingBank, bankAccount, hasBankAccount, refreshBank } = useUser();

  const normalizeStatus = (s: string): WithdrawalItem['status'] => {
    const val = (s || '').trim().toUpperCase();
    if (['IN PROGRESS', 'PENDING'].includes(val)) return 'PENDING';
    if (['COMPLETE', 'COMPLETED', 'SUCCESS'].includes(val)) return 'SUCCESS';
    if (['DECLINED', 'REJECTED', 'FAILED'].includes(val)) return 'DECLINED';
    return 'PENDING';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-MY');
  };

  const mapApiToUi = (rows: ApiWithdrawal[]): WithdrawalItem[] =>
    (rows || [])
      .map((r) => ({
        id: r.id,
        date: formatDate(r.createdAt),
        amount: Number(r.amount ?? 0).toFixed(2),
        status: normalizeStatus(r.status),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusLabel: Record<WithdrawalItem['status'], string> = {
    PENDING: t.withdrawal.statusPending,
    SUCCESS: t.withdrawal.statusSuccess,
    DECLINED: t.withdrawal.statusDeclined,
  };

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiWithdrawal[]>('/customer/get-withdrawal-history');
      const result = await getTotalTransaction();
      setPointsAwarded(result?.pointsAwarded ?? 0);
      setHistory(mapApiToUi(res.data));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProfile();
    await load();
    setRefreshing(false);
  }, [load, loadUserProfile]);

  useEffect(() => {
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${signalRUrl}/withdrawalHub`, {
        accessTokenFactory: async () => (await authStorage.getAccessToken()) ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('WithdrawalChanged', () => {
      load();
    });

    (async () => {
      try {
        await connection.start();
      } catch (e) {
        console.warn('Hub connect failed', e);
      }
    })();

    return () => {
      connection.stop();
    };
  }, [load, signalRUrl]);

  useEffect(() => {
    if (!loadingBank && !hasBankAccount) {
      setBankModalVisible(true);
    }
  }, [loadingBank, hasBankAccount]);

  useEffect(() => {
    (async () => {
      await loadUserProfile();
      await load();
    })();
  }, [load, loadUserProfile]);

  const bankBadge = useMemo(() => {
    if (!hasBankAccount || !bankAccount) return null;
    return `(${getBankNameByCode(bankAccount.bankCode) ?? bankAccount.bankCode}) • ${bankAccount.accountNumber}`;
  }, [bankAccount, hasBankAccount]);

  const maxWithdraw = Number(pointsAwarded).toFixed(2);
  const parsedAmount = parseFloat(withdrawalAmount);
  const canWithdraw =
    hasBankAccount && !isNaN(parsedAmount) && parsedAmount >= 1.0 && parsedAmount <= pointsAwarded;

  const handleWithdraw = async () => {
    if (!hasBankAccount) {
      setBankModalVisible(true);
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount < 1.0) {
      Alert.alert(t.withdrawal.invalidAmount, t.withdrawal.invalidAmountMessage);
      return;
    }
    if (parsedAmount > pointsAwarded) {
      Alert.alert(t.withdrawal.insufficientBalance, t.withdrawal.insufficientBalanceMessage);
      return;
    }

    try {
      setWithdrawing(true);
      await api.post('/payout/customer', { amount: parsedAmount });
      await load();
      setWithdrawalAmount('');
      Alert.alert(t.common.success, t.withdrawal.withdrawalSubmitted);
    } catch (e: any) {
      Alert.alert(t.common.error, e?.response?.data?.error ?? t.withdrawal.withdrawalFailed);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setWithdrawalAmount(cleaned);
  };

  function StatusBadge({ status }: { status: WithdrawalItem['status'] }) {
    const bg =
      status === 'SUCCESS' ? '#DCFCE7' : status === 'DECLINED' ? '#FEE2E2' : '#F3F4F6';
    const color =
      status === 'SUCCESS' ? '#166534' : status === 'DECLINED' ? '#991B1B' : '#374151';
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{statusLabel[status]}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t.common.back}
            >
              <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.withdrawal.title}</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DashboardTheme.walletGreen} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={DashboardTheme.headerGreen}
                colors={[DashboardTheme.headerGreen]}
              />
            }
          >
            {/* Payout card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{t.withdrawal.payoutTo}</Text>
              {hasBankAccount && bankBadge ? (
                <View style={styles.payoutRow}>
                  <Text style={styles.bankText}>{bankBadge}</Text>
                  <Text style={styles.defaultTag}>{t.withdrawal.default}</Text>
                </View>
              ) : (
                <Text style={styles.bankTextMuted}>{t.withdrawal.addBankAccount}</Text>
              )}
              <TouchableOpacity
                style={styles.changeBankButton}
                onPress={() => setBankModalVisible(true)}
              >
                <Text style={styles.changeBankText}>
                  {hasBankAccount ? t.withdrawal.changeBank : t.withdrawal.addBankAccount}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{t.withdrawal.withdrawalAmount}</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountPrefix}>RM</Text>
                <TextInput
                  style={styles.amountInput}
                  value={withdrawalAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="00.00"
                  placeholderTextColor="rgba(46, 125, 50, 0.4)"
                />
              </View>
              <View style={styles.amountDivider} />
              <Text style={styles.withdrawHint}>
                {interpolate(t.withdrawal.withdrawUpTo, { amount: maxWithdraw })}
              </Text>
              <TouchableOpacity
                style={[styles.withdrawButton, !canWithdraw && styles.withdrawButtonDisabled]}
                onPress={handleWithdraw}
                disabled={!canWithdraw}
              >
                <Text style={styles.withdrawButtonText}>{t.withdrawal.withdrawButton}</Text>
              </TouchableOpacity>
            </View>

            {/* History card */}
            <View style={[styles.card, styles.historyCard]}>
              <Text style={styles.historyTitle}>{t.withdrawal.withdrawalHistory}</Text>
              {history.length === 0 ? (
                <Text style={styles.emptyHistory}>{t.withdrawal.noWithdrawals}</Text>
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
                  renderItem={({ item }) => (
                    <View style={styles.historyRow}>
                      <View style={styles.historyRowLeft}>
                        <Text style={styles.historyDate}>{item.date}</Text>
                        <StatusBadge status={item.status} />
                      </View>
                      <Text style={styles.historyAmount}>RM {item.amount}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <WithdrawalOverlay
        visible={withdrawing}
        text={t.withdrawal.processingWithdrawal}
        subtext={t.withdrawal.processingSubtext}
      />
      <BankAccountModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        onSaved={refreshBank}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DashboardTheme.screenBg,
  },
  headerSafeArea: {
    backgroundColor: DashboardTheme.headerGreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: DashboardTheme.headerGreen,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: DashboardTheme.textOnGreen,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    ...cardStyle,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  bankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
    flexShrink: 1,
  },
  bankTextMuted: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  defaultTag: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  changeBankButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: DashboardTheme.walletGreen,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  changeBankText: {
    color: DashboardTheme.walletGreen,
    fontWeight: '600',
    fontSize: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountPrefix: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
    marginRight: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
    padding: 0,
    minHeight: 44,
  },
  amountDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
    marginBottom: 10,
  },
  withdrawHint: {
    fontSize: 13,
    color: '#5B6B73',
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: DashboardTheme.walletGreen,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  withdrawButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    minHeight: 160,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
    marginBottom: 12,
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 24,
  },
  historySeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyRowLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: '#374151',
  },
  historyAmount: {
    fontWeight: '700',
    fontSize: 16,
    color: DashboardTheme.walletGreen,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
