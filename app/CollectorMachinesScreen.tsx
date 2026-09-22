import MachineCard from "@/components/atoms/MachineCard";
import SortButton from "@/components/atoms/SortButton";
import GreenScreenHeader from "@/components/GreenScreenHeader";
import { DashboardTheme } from "@/constants/dashboardTheme";
import { MachineVolume } from "@/constants/Machine";
import { useMachineLiveUpdates } from "@/hooks/useMachineLiveUpdates";
import { fetchCollectorMachines } from "@/services/machine";
import { Stack } from 'expo-router';
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useLanguage } from '../services/languageService';

type SortKey = "pct" | "name" | "status";
const pct = (c: number, cap: number) => (cap <= 0 ? 0 : Math.round((c / cap) * 100));

// Telemetry downscale formula from 500L hardcoded Python value to true 100L capacity
const getTrueVolume = (m: MachineVolume) => {
    const rawVolume = m.metrics?.mainTankVolumeLiters || 0;
    const trueCapacity = m.capacityLiters || 100;
    return Math.max(0, (rawVolume / 500) * trueCapacity);
};

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
            // Carefully spelled: fetchCollectorMachines
            const data = await fetchCollectorMachines();
            setMachines(data ?? []);
        } catch (e: any) {
            setError(e?.message ?? t.collectorMachines.failedToLoad);
        } finally {
            setLoading(false);
        }
    }, [t])
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try { await load(); } finally { setRefreshing(false); }
    }, [load]);

    useMachineLiveUpdates(true, (payload) => {
        if (!payload.machineId) return;
        setMachines((prev) =>
            prev.map((x) => (x.machineId === payload.machineId ? { ...x, ...payload, bufferVolume: payload.bufferVolume ?? x.bufferVolume } : x))
        );
    });

    React.useEffect(() => { load(); }, [load]);

    // Calculate Grand Total UCO Volume across all machines
    const totalUCOVolume = React.useMemo(() => {
        return machines.reduce((total, m) => total + getTrueVolume(m), 0);
    }, [machines]);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        let data = machines.filter((m) =>
            !q ||
            m.machineLocationName.toLowerCase().includes(q) ||
            m.machineId.toLowerCase().includes(q)
        );

        switch (sortKey) {
            case "name": data = data.sort((a, b) => a.machineLocationName.localeCompare(b.machineLocationName)); break;
            // Uses our mapped true volume for accurate sorting
            default: data = data.sort((a, b) => pct(getTrueVolume(b), b.capacityLiters) - pct(getTrueVolume(a), a.capacityLiters));
        }
        return data;
    }, [machines, search, sortKey]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.screen}>
                <GreenScreenHeader title={t.collectorMachines.title} />

                <View style={styles.toolbar}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Total UCO Volume Ready</Text>
                        <Text style={styles.summaryValue}>{totalUCOVolume.toFixed(2)} L</Text>
                    </View>

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t.collectorMachines.searchPlaceholder}
                        style={styles.search}
                        placeholderTextColor="#9CA3AF"
                    />
                    <View style={styles.sortRow}>
                        <SortButton label={t.collectorMachines.fullness} active={sortKey === "pct"} onPress={() => setSortKey("pct")} />
                        <SortButton label={t.collectorMachines.name} active={sortKey === "name"} onPress={() => setSortKey("name")} />
                    </View>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={DashboardTheme.walletGreen} size="large" />
                        <Text style={styles.stateText}>{t.collectorMachines.loadingMachines}</Text>
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={styles.errorText}>{error}</Text>
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
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={DashboardTheme.walletGreen}
                            />
                        }
                        renderItem={({ item }) => <MachineCard m={item} />}
                        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                        initialNumToRender={6}
                        windowSize={10}
                        removeClippedSubviews
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: DashboardTheme.screenBg },
    toolbar: { gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    summaryBox: {
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DashboardTheme.walletGreen,
    },
    summaryLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
    summaryValue: { fontSize: 28, color: DashboardTheme.walletGreen, fontWeight: 'bold', marginTop: 4 },
    search: {
        backgroundColor: '#fff',
        borderColor: DashboardTheme.borderLight,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1a1a1a',
    },
    sortRow: { flexDirection: 'row', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    listSeparator: { height: 4 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    stateText: { marginTop: 12, fontSize: 15, color: '#5B6B73', textAlign: 'center' },
    errorText: { fontSize: 15, color: '#C62828', textAlign: 'center' },
    retry: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: DashboardTheme.walletGreen, borderRadius: 8 },
    retryText: { color: DashboardTheme.textOnGreen, fontWeight: '600', fontSize: 15 },
});