import { BANKS } from "@/constants/Banks";
import React, { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from '../../services/userService';
type Props = {
    visible: boolean;
    onClose: () => void;
    onSaved?: () => void; // optional callback if parent wants to react
};

export default function BankAccountModal({ visible, onClose, onSaved }: Props) {
    const { updateBankAccount } = useUser();
    const [search, setSearch] = useState("");
    const [selectedBank, setSelectedBank] = useState<{ name: string; code: string } | null>(null);
    const [accountNumber, setAccountNumber] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? BANKS.filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) : BANKS;
    }, [search]);

    const canSave = selectedBank && accountNumber.trim().length >= 5;

    const save = async () => {
        if (!canSave) return;
        await updateBankAccount({
            bankName: selectedBank!.name,
            bankCode: selectedBank!.code,
            accountNumber: accountNumber.trim(),
        });
        onSaved?.();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.backdrop}>
                    <View style={styles.sheet}>
                        <Text style={styles.title}>Set up your bank account</Text>
                        <Text style={styles.subtitle}>Choose your bank and enter your account number to receive payouts.</Text>

                        <TextInput
                            placeholder="Search bank by name or code"
                            style={styles.input}
                            value={search}
                            onChangeText={setSearch}
                        />

                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.code}
                            style={{ maxHeight: 240, marginTop: 8 }}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedBank(item)}
                                    style={[
                                        styles.bankRow,
                                        selectedBank?.code === item.code && styles.bankRowSelected
                                    ]}
                                >
                                    <Text style={styles.bankName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TextInput
                            placeholder="Account number"
                            keyboardType="number-pad"
                            value={accountNumber}
                            onChangeText={(t) => setAccountNumber(t.replace(/[^\d-]/g, ""))} // allow digits (and hyphen if you need)
                            style={[styles.input, { marginTop: 12 }]}
                        />

                        <View style={styles.actions}>
                            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.outline]}>
                                <Text style={[styles.btnText, { color: "#2E7D32" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={save}
                                disabled={!canSave}
                                style={[styles.btn, { backgroundColor: canSave ? "#2E7D32" : "#A5D6A7" }]}
                            >
                                <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    sheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
    title: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
    subtitle: { color: "#555", marginTop: 4 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 12 },
    bankRow: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, padding: 12 },
    bankRowSelected: { borderColor: "#2E7D32", backgroundColor: "#F4F9F4" },
    bankName: { fontWeight: "600" },
    bankCode: { color: "#2E7D32", marginTop: 2 },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 16 },
    btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
    outline: { borderWidth: 1, borderColor: "#2E7D32", backgroundColor: "transparent" },
    btnText: { fontWeight: "700" },
});
