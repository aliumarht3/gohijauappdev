import MachineCard from "@/components/atoms/MachineCard";
import SortButton from "@/components/atoms/SortButton";
import GreenScreenHeader from "@/components/GreenScreenHeader";
import { DashboardTheme } from "@/constants/dashboardTheme";
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

    useMachineLiveUpdates(true, (payload) => {
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
            m.machineId.toLowerCase().includes(q)
        );

        switch (sortKey) {
            case "name": data = data.sort((a, b) => a.machineLocationName.localeCompare(b.machineLocationName)); break;
            default: data = data.sort((a, b) => pct(b.bufferVolume, b.capacityLiters) - pct(a.bufferVolume, a.capacityLiters));
        }
        return data;
    }, [machines, search, sortKey]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.screen}>
                <GreenScreenHeader title={t.collectorMachines.title} />

                <View style={styles.toolbar}>
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
    screen: {
        flex: 1,
        backgroundColor: DashboardTheme.screenBg,
    },
    toolbar: {
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
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
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    listSeparator: {
        height: 4,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    stateText: {
        marginTop: 12,
        fontSize: 15,
        color: '#5B6B73',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 15,
        color: '#C62828',
        textAlign: 'center',
    },
    retry: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: DashboardTheme.walletGreen,
        borderRadius: 8,
    },
    retryText: {
        color: DashboardTheme.textOnGreen,
        fontWeight: '600',
        fontSize: 15,
    },
});
