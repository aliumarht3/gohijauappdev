import { BANKS } from '@/constants/Banks';
import { DashboardTheme } from '@/constants/dashboardTheme';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../../services/languageService';
import { useUser } from '../../services/userService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function BankAccountModal({ visible, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const { updateBankAccount } = useUser();
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ name: string; code: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearch('');
      setSelectedBank(null);
      setAccountNumber('');
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? BANKS.filter(
          (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q),
        )
      : BANKS;
  }, [search]);

  const canSave = selectedBank && accountNumber.trim().length >= 5;

  const save = async () => {
    if (!canSave) return;
    await updateBankAccount({
      bankCode: selectedBank!.code,
      accountNumber: accountNumber.trim(),
    });
    onSaved?.();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t.bankModal.title}</Text>
          <Text style={styles.subtitle}>{t.bankModal.subtitle}</Text>

          <TextInput
            placeholder={t.bankModal.searchPlaceholder}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            style={styles.bankList}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.bankSeparator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedBank(item)}
                style={[
                  styles.bankRow,
                  selectedBank?.code === item.code && styles.bankRowSelected,
                ]}
              >
                <Text style={styles.bankName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <TextInput
            placeholder={t.bankModal.accountNumberPlaceholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text.replace(/[^\d-]/g, ''))}
            style={styles.input}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnOutline]}>
              <Text style={styles.btnOutlineText}>{t.bankModal.cancelButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              disabled={!canSave}
              style={[styles.btn, styles.btnPrimary, !canSave && styles.btnDisabled]}
            >
              <Text style={styles.btnPrimaryText}>{t.bankModal.saveButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DashboardTheme.walletGreen,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: DashboardTheme.borderLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  bankList: {
    maxHeight: 220,
    marginTop: 12,
  },
  bankSeparator: {
    height: 10,
  },
  bankRow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  bankRowSelected: {
    borderColor: DashboardTheme.walletGreen,
    backgroundColor: '#F1F8E9',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: DashboardTheme.walletGreen,
    backgroundColor: '#fff',
  },
  btnOutlineText: {
    color: DashboardTheme.walletGreen,
    fontWeight: '600',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: DashboardTheme.walletGreen,
  },
  btnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
