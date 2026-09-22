import { DashboardTheme } from "@/constants/dashboardTheme";
import { MachineVolume } from "@/constants/Machine";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import VolumeGauge from "./VolumeGauge";

const pct = (current: number, capacity: number) =>
    capacity <= 0 ? 0 : Math.round((current / capacity) * 100);

const formatLiters = (n: number) => `${n.toFixed(2)} L`;

export default function MachineCard({ m }: { m: MachineVolume }) {
    // Replicate Vue true capacity downscaling logic
    const rawVolume = m.metrics?.mainTankVolumeLiters || 0;
    const trueCapacity = m.capacityLiters || 100;
    const correctedVolume = Math.max(0, (rawVolume / 500) * trueCapacity);
    const percentFull = pct(correctedVolume, trueCapacity);

    // Extract Status & Telemetry Metrics
    const isOnline = m.isOnline ?? false;
    const turbidity = m.metrics?.turbidityValue || 0;
    const isPoorQuality = turbidity > 600;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{m.machineLocationName}</Text>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#ef4444' }]} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.gaugeWrap}>
                    <VolumeGauge percent={percentFull} />
                </View>

                <View style={styles.details}>
                    <Text style={styles.kvLabel}>Machine ID</Text>
                    <Text style={styles.kvValue} numberOfLines={1}>{m.machineId ?? "-"}</Text>

                    <Text style={[styles.kvLabel, styles.kvLabelSpaced]}>UCO Volume</Text>
                    <Text style={styles.kvValue}>
                        {formatLiters(correctedVolume)} / {formatLiters(trueCapacity)}
                    </Text>
                </View>
            </View>

            {/* Telemetry Metrics Container matching Vue styling */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Oil Quality</Text>
                    <Text style={[styles.metricValue, { color: isPoorQuality ? '#ef4444' : '#22c55e' }]}>
                        {turbidity} <Text style={styles.metricSubtext}>({isPoorQuality ? 'Poor' : 'Good'})</Text>
                    </Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Junk Tank</Text>
                    <Text style={[styles.metricValue, { color: '#1f2937' }]}>
                        {m.metrics?.junkTankDistanceCm || 0} cm <Text style={styles.metricSubtext}>to top</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: DashboardTheme.borderLight,
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    gaugeWrap: {
        position: 'relative',
        width: 110,
        height: 110,
    },
    details: {
        flex: 1,
        marginLeft: 16,
    },
    kvLabel: {
        color: '#5B6B73',
        fontSize: 12,
    },
    kvLabelSpaced: {
        marginTop: 8,
    },
    kvValue: {
        color: DashboardTheme.walletGreen,
        fontSize: 14,
        fontWeight: '600',
    },
    metricsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    metricBox: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    metricSubtext: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#6b7280',
    },
});