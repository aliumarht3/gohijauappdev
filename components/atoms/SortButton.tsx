import { DashboardTheme } from "@/constants/dashboardTheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function SortButton({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.btn, active && styles.active]}>
            <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        borderWidth: 2,
        borderColor: DashboardTheme.borderLight,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    active: {
        borderColor: DashboardTheme.walletGreen,
        backgroundColor: '#E8F5E9',
    },
    text: {
        color: '#5B6B73',
        fontSize: 13,
        fontWeight: '600',
    },
    textActive: {
        color: DashboardTheme.walletGreen,
        fontWeight: '700',
    },
});
