import { Colors } from "@/constants/Colors";
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
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.surface,
        marginRight: 8,
    },
    active: { borderColor: Colors.primary, backgroundColor: Colors.surfaceAlt },
    text: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
    textActive: { color: Colors.primary, fontWeight: "700" },
});