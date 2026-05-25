import { useBottomTabOverflow } from '@/components/CustomTabBar';
import CustomAlert from "@/components/molecules/CustomAlert";
import { generateQrTokenCollector } from "@/services/qrService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useLanguage } from '../services/languageService';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function OilCollectorHomeScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const tabBarPadding = useBottomTabOverflow();
    const [UCOAlertVisible, setUCOAlertVisible] = useState(false);
    const [paymentsAlertVisible, setPaymentsAlertVisible] = useState(false);
    const [transactionsAlertVisible, setTransactionsAlertVisible] = useState(false);
    const [alertFailedToGenerateVisible, setAlertFailedToGenerateVisible] = useState(false);
    const collectorStats = [
        { label: t.collectorHome.ucoLevels, value: "0%", unit: "" },
        { label: t.collectorHome.collectionsToday, value: 0, unit: "" },
        { label: t.collectorHome.transactions, value: 0, unit: "" },
    ];
    const handleGenerateToken = async () => {
        const token = await generateQrTokenCollector();
        console.log('Generated Token:', token);
        if (token) {
            router.push({
                pathname: '/QRCodeScreen',
                params: {
                    token
                }
            });
        } else {
            setAlertFailedToGenerateVisible(true);
        }
    };
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: tabBarPadding }}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{t.collectorHome.greeting}</Text>
                    <Text style={styles.subtitle}>{t.collectorHome.subtitle}</Text>
                </View>
                <Image
                    source={require("../assets/images/icon.png")}
                    style={styles.profileImage}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                {collectorStats.map((item, index) => (
                    <View key={index} style={styles.statCard}>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/CollectorMachinesScreen')}
                >
                    <Ionicons name="water" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.collectorHome.monitorUCO}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleGenerateToken}
                >
                    <Ionicons name="trash" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.collectorHome.scanToCollect}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/CollectorTransactionScreen')}
                >
                    <Ionicons name="time" size={28} color="#fff" />
                    <Text style={styles.actionText}>{t.collectorHome.transactions}</Text>
                </TouchableOpacity>
                <CustomAlert
                    visible={alertFailedToGenerateVisible}
                    title={t.common.failedTitle}
                    message={t.common.failedQrGeneration}
                    onClose={() => { setAlertFailedToGenerateVisible(false); }}
                />
                <CustomAlert
                    visible={UCOAlertVisible}
                    title={t.common.comingSoon}
                    message={t.collectorHome.comingSoonUCO}
                    onClose={() => { setUCOAlertVisible(false); }}
                />
                <CustomAlert
                    visible={paymentsAlertVisible}
                    title={t.common.comingSoon}
                    message={t.collectorHome.comingSoonPayment}
                    onClose={() => { setPaymentsAlertVisible(false); }}
                />
                <CustomAlert
                    visible={transactionsAlertVisible}
                    title={t.common.comingSoon}
                    message={t.collectorHome.comingSoonTransaction}
                    onClose={() => { setTransactionsAlertVisible(false); }}
                />
            </View>

            {/* Collection Map */}
            <View style={styles.mapCard}>
                <Text style={styles.mapTitle}>{t.collectorHome.machinesRequiringCollection}</Text>
                <Image
                    source={require("../assets/images/mapbackground.jpg")}
                    style={styles.mapImage}
                />
                <TouchableOpacity
                    style={styles.mapButton}
                // onPress={() => router.push("/CollectorMapScreen")}
                >
                    <Text style={styles.mapButtonText}>{t.collectorHome.viewOnMap}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 0, backgroundColor: "#f2f8f3", paddingHorizontal: 20, paddingTop: 50 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
    greeting: { fontSize: 22, fontWeight: "bold", color: "#2E7D32" },
    subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
    profileImage: { width: 50, height: 50, borderRadius: 25 },
    statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
    statCard: { flex: 1, backgroundColor: "#fff", padding: 15, marginHorizontal: 5, borderRadius: 12, alignItems: "center", elevation: 3 },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#388E3C", textAlign: "center" },
    statLabel: { fontSize: 13, color: "#666", marginTop: 4, textAlign: "center" },
    quickActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 25 },
    actionButton: { width: "47%", backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
    actionText: { color: "#fff", marginTop: 6, fontWeight: "600", fontSize: 14, textAlign: "center" },
    mapCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 25, elevation: 3 },
    mapTitle: { fontSize: 16, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },
    mapImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
    mapButton: { backgroundColor: "#388E3C", padding: 10, borderRadius: 8, alignItems: "center" },
    mapButtonText: { color: "#fff", fontWeight: "bold" },
});
