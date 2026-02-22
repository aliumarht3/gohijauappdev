import MachineCard from "@/components/atoms/MachineCard";
import SortButton from "@/components/atoms/SortButton";
import { Colors } from "@/constants/Colors";
import { MachineVolume } from "@/constants/Machine";
import { useMachineLiveUpdates } from "@/hooks/useMachineLiveUpdates";
import { fetchCollectorMachines } from "@/services/machine";
import { Stack } from 'expo-router';
import React from "react";
import { useLanguage } from '../services/languageService';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type SortKey = "pct" | "name" | "status";
const pct = (c: number, cap: number) => (cap <= 0 ? 0 : Math.round((c / cap) * 100));

export default function CollectorMachinesScreen() {
    const { t } = useLanguage();
    const [search, setSearch] = React.useState("");
    const [sortKey, setSortKey] = React.useState<SortKey>("pct");
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [machines, setMachines] = React.useState<MachineVolume[]>([]);

    const load = React.useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await fetchCollectorMachines();
            console.log("Loaded machines:", data);
            setMachines(data ?? []);
        } catch (e: any) {
            setError(e?.message ?? t.collectorMachines.failedToLoad);
        } finally {
            setLoading(false);
        }
    }, [t]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try { await load(); } finally { setRefreshing(false); }
    }, [load]);

    // live updates (keep true if your hub is live)
    useMachineLiveUpdates(true, (payload) => { // turn to true when backend ready
        if (!payload.machineId) return;
        setMachines((prev) =>
            prev.map((x) => (x.machineId === payload.machineId ? { ...x, ...payload, bufferVolume: payload.bufferVolume ?? x.bufferVolume } : x))
        );
    });

    React.useEffect(() => { load(); }, [load]);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        let data = machines.filter((m) =>
            !q ||
            m.machineLocationName.toLowerCase().includes(q) ||
            // (m.location ?? "").toLowerCase().includes(q) ||
            m.machineId.toLowerCase().includes(q)
        );

        switch (sortKey) {
            case "name": data = data.sort((a, b) => a.machineLocationName.localeCompare(b.machineLocationName)); break;
            // case "status": data = data.sort((a, b) => (a.status ?? "").localeCompare(b.status ?? "")); break;
            default: data = data.sort((a, b) => pct(b.bufferVolume, b.capacityLiters) - pct(a.bufferVolume, a.capacityLiters));
        }
        return data;
    }, [machines, search, sortKey]);

    return (
        <>
            <SafeAreaView style={styles.container}>
                <Stack.Screen
                    options={{
                        title: t.collectorMachines.title,
                        headerShown: true,
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: Colors.light.background },
                        headerTintColor: '#2E7D32',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                            fontSize: 20,
                        },
                    }}
                />
                <View style={styles.toolbar}>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t.collectorMachines.searchPlaceholder}
                        style={styles.search}
                        placeholderTextColor={Colors.textSecondary}
                    />
                    <View style={styles.sortRow}>
                        <SortButton label={t.collectorMachines.fullness} active={sortKey === "pct"} onPress={() => setSortKey("pct")} />
                        <SortButton label={t.collectorMachines.name} active={sortKey === "name"} onPress={() => setSortKey("name")} />
                        {/* <SortButton label="Status" active={sortKey === "status"} onPress={() => setSortKey("status")} /> */}
                    </View>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={Colors.primary} />
                        <Text style={styles.stateText}>{t.collectorMachines.loadingMachines}</Text>
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={[styles.stateText, { color: Colors.danger }]}>{error}</Text>
                        <TouchableOpacity style={styles.retry} onPress={load}>
                            <Text style={styles.retryText}>{t.common.retry}</Text>
                        </TouchableOpacity>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.stateText}>{t.collectorMachines.noMachines}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.machineId}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                        renderItem={({ item }) => <MachineCard m={item} />}
                        initialNumToRender={6}
                        windowSize={10}
                        removeClippedSubviews
                    />
                )}
            </SafeAreaView>
        </>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 16 },
    screenTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: "700", marginTop: 8 },
    subtitle: { color: Colors.textSecondary, marginBottom: 8 },

    toolbar: { gap: 10, marginTop: 8, marginBottom: 10 },
    search: {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: Colors.textPrimary,
    },
    sortRow: { flexDirection: "row", alignItems: "center" },

    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    stateText: { marginTop: 10, color: Colors.textSecondary },

    retry: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    retryText: { color: "white", fontWeight: "600" },
});