import { DashboardTheme } from "@/constants/dashboardTheme";
import { MachineVolume } from "@/constants/Machine";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import VolumeGauge from "./VolumeGauge";

const pct = (current: number, capacity: number) =>
    capacity <= 0 ? 0 : Math.round((current / capacity) * 100);

const formatLiters = (n: number) => `${n.toFixed(2)} L`;

export default function MachineCard({ m }: { m: MachineVolume }) {
    const percentFull = pct(m.bufferVolume, m.capacityLiters);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{m.machineLocationName}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.gaugeWrap}>
                    <VolumeGauge percent={percentFull} />
                </View>

                <View style={styles.details}>
                    <Text style={styles.kvLabel}>Machine Name</Text>
                    <Text style={styles.kvValue} numberOfLines={1}>{m.machineId ?? "-"}</Text>

                    <Text style={[styles.kvLabel, styles.kvLabelSpaced]}>Current Volume</Text>
                    <Text style={styles.kvValue}>
                        {formatLiters(m.bufferVolume)} / {formatLiters(m.capacityLiters)}
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
});
