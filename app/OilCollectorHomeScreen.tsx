import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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
    const router = useRouter();

    const collectorStats = [
        { label: "UCO Levels", value: "75%", unit: "" },
        { label: "Collections Today", value: 5, unit: "" },
        { label: "Transactions", value: 12, unit: "" },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello Collector 🚛</Text>
                    <Text style={styles.subtitle}>Manage UCO collections efficiently</Text>
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
                // onPress={() => router.push("/UcoMonitorScreen")}
                >
                    <Ionicons name="water" size={28} color="#fff" />
                    <Text style={styles.actionText}>Monitor UCO</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                // onPress={() => router.push("/EmptyMachineScreen")}
                >
                    <Ionicons name="trash" size={28} color="#fff" />
                    <Text style={styles.actionText}>Empty Machine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                // onPress={() => router.push("/PaymentsScreen")}
                >
                    <Ionicons name="card" size={28} color="#fff" />
                    <Text style={styles.actionText}>Payments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                // onPress={() => router.push("/CollectorTransactionsScreen")}
                >
                    <Ionicons name="time" size={28} color="#fff" />
                    <Text style={styles.actionText}>Transactions</Text>
                </TouchableOpacity>
            </View>

            {/* Collection Map */}
            <View style={styles.mapCard}>
                <Text style={styles.mapTitle}>Machines Requiring Collection</Text>
                <Image
                    source={require("../assets/images/mapbackground.jpg")}
                    style={styles.mapImage}
                />
                <TouchableOpacity
                    style={styles.mapButton}
                // onPress={() => router.push("/CollectorMapScreen")}
                >
                    <Text style={styles.mapButtonText}>View on Map</Text>
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
    statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
    quickActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 25 },
    actionButton: { width: "47%", backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
    actionText: { color: "#fff", marginTop: 6, fontWeight: "600" },
    mapCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 25, elevation: 3 },
    mapTitle: { fontSize: 16, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },
    mapImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
    mapButton: { backgroundColor: "#388E3C", padding: 10, borderRadius: 8, alignItems: "center" },
    mapButtonText: { color: "#fff", fontWeight: "bold" },
});
