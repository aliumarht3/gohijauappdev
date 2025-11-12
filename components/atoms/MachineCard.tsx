import { Colors } from "@/constants/Colors";
import { MachineVolume } from "@/constants/Machine";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import VolumeGauge from "./VolumeGauge";
const badgeColor = (status?: string) => {
    switch (status) {
        case "Online": return Colors.success;
        case "Offline": return Colors.danger;
        case "Maintenance": return Colors.warning;
        default: return Colors.muted;
    }
};

const pct = (current: number, capacity: number) =>
    capacity <= 0 ? 0 : Math.round((current / capacity) * 100);

const formatLiters = (n: number) => `${n.toFixed(2)} L`;

// function estimateDaysToFull(trend: number[] | undefined, current: number, capacity: number) {
//     if (!trend || trend.length < 2) return null;
//     const diffs: number[] = [];
//     for (let i = 1; i < trend.length; i++) diffs.push(trend[i] - trend[i - 1]);
//     const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
//     if (avg <= 0) return null;
//     const remaining = Math.max(0, capacity - current);
//     return Math.ceil(remaining / avg);
// }

export default function MachineCard({ m }: { m: MachineVolume }) {
    const percentFull = pct(m.bufferVolume, m.capacityLiters);
    // const days = estimateDaysToFull( m.currentLiters, m.capacityLiters);

    return (
        <>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{m.machineLocationName}</Text>
                    {/* <View style={[styles.badge, { backgroundColor: badgeColor(m.status) }]}>
                    <Text style={styles.badgeText}>{m.status ?? "Unknown"}</Text> */}
                    {/* </View> */}
                </View>

                <View style={styles.cardBody}>
                    <View style={{ position: "relative", width: 110, height: 110 }}>
                        <VolumeGauge percent={percentFull} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.kvLabel}>Machine Name</Text>
                        <Text style={styles.kvValue} numberOfLines={1}>{m.machineId ?? "-"}</Text>

                        <Text style={[styles.kvLabel, { marginTop: 8 }]}>Current Volume</Text>
                        <Text style={styles.kvValue}>
                            {formatLiters(m.bufferVolume)} / {formatLiters(m.capacityLiters)}
                        </Text>

                        {/* <View style={{ marginTop: 10 }}>
                        <Sparkline values={m.trendLitersLast7 ?? []} />
                        <Text style={styles.sparklineHint}>7-day fill trend</Text>
                    </View> */}
                    </View>
                </View>

                {/* <View style={styles.cardFooter}>
                {days !== null ? (
                    <Text style={styles.hintText}>
                        Est. full in <Text style={styles.hintBold}>{days} day{days > 1 ? "s" : ""}</Text>
                    </Text>
                ) : (
                    <Text style={styles.hintText}>Est. full: <Text style={styles.hintBold}>N/A</Text></Text>
                )}
                <Text style={styles.hintText}>
                    Last collection: <Text style={styles.hintBold}>
                        {m.lastCollectionAt ? dayjs(m.lastCollectionAt).format("DD MMM, HH:mm") : "—"}
                    </Text>
                </Text>
            </View> */}
            </View>
        </>

    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        padding: 14,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { color: "white", fontWeight: "700", fontSize: 11 },

    cardBody: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    kvLabel: { color: Colors.textSecondary, fontSize: 12 },
    kvValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: "600" },
    sparklineHint: { color: Colors.muted, fontSize: 10, marginTop: 2 },

    cardFooter: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    hintText: { color: Colors.textSecondary, fontSize: 12 },
    hintBold: { color: Colors.textPrimary, fontWeight: "700" },
});