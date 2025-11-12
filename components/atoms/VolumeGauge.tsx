import { Colors } from "@/constants/Colors";
import React from "react";
import { Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

const SIZE = 110;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export default function VolumeGauge({ percent }: { percent: number }) {
    const p = clamp(percent / 100);
    const dash = CIRC * p;
    const track = "#e5e7eb";
    const ring =
        percent >= 85 ? Colors.danger : percent >= 60 ? Colors.warning : Colors.success;

    return (
        <>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={Colors.border} strokeWidth={STROKE} fill="none" />
                <Circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    stroke={ring}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${dash}, ${CIRC}`}
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
            </Svg>
            <Text
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: SIZE / 2 - 12,
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: 18,
                    color: "colors.textPrimary",
                }}
            >
                {Math.round(percent)}%
            </Text>
        </>
    );
}
