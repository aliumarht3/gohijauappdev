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

export default function TechnicianHomeScreen() {
    const router = useRouter();

    const healthStats = [
        { label: "Hardware Status", value: "OK", unit: "" },
        { label: "Software Status", value: "OK", unit: "" },
        { label: "Errors Detected", value: 2, unit: "" },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello Technician 👨‍🔧</Text>
                    <Text style={styles.subtitle}>Keep machines running smoothly</Text>
                </View>
                <Image
                    source={require("../assets/images/icon.png")}
                    style={styles.profileImage}
                />
            </View>

            {/* System Health */}
            <View style={styles.statsContainer}>
                {healthStats.map((item, index) => (
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
                // onPress={() => router.push("/MaintenanceScreen")}
                >
                    <Ionicons name="construct" size={28} color="#fff" />
                    <Text style={styles.actionText}>Maintenance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                // onPress={() => router.push("/TroubleshootScreen")}
                >
                    <Ionicons name="alert-circle" size={28} color="#fff" />
                    <Text style={styles.actionText}>Troubleshoot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                // onPress={() => router.push("/ErrorLogsScreen")}
                >
                    <Ionicons name="bug" size={28} color="#fff" />
                    <Text style={styles.actionText}>Error Logs</Text>
                </TouchableOpacity>
            </View>

            {/* Machine Map */}
            <View style={styles.mapCard}>
                <Text style={styles.mapTitle}>Machines Overview</Text>
                <Image
                    source={require("../assets/images/mapbackground.jpg")}
                    style={styles.mapImage}
                />
                <TouchableOpacity
                    style={styles.mapButton}
                // onPress={() => router.push("/MachinesMapScreen")}
                >
                    <Text style={styles.mapButtonText}>View Machines</Text>
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
    quickActions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
    actionButton: { flex: 1, backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, alignItems: "center", marginHorizontal: 5 },
    actionText: { color: "#fff", marginTop: 6, fontWeight: "600" },
    mapCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 25, elevation: 3 },
    mapTitle: { fontSize: 16, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },
    mapImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
    mapButton: { backgroundColor: "#388E3C", padding: 10, borderRadius: 8, alignItems: "center" },
    mapButtonText: { color: "#fff", fontWeight: "bold" },
});
// 