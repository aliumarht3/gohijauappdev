import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const SIZE = 36;       // Diameter of the circle
const STROKE = 4;      // Circle stroke width
const R = (SIZE - STROKE) / 2; // Radius
const CIRC = 2 * Math.PI * R;

// Clamp helper 0..1
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const pct = (current: number, capacity: number) =>
    capacity <= 0 ? 0 : Math.round((current / capacity) * 100);

export default function CircleProgressIndicator({ bufferVolume, capacityLiters }) {
    console.log("bufferVolume:", bufferVolume);
  const buffer = bufferVolume ?? 0;
  const capacity = capacityLiters ?? 0;
  const percent = pct(buffer, capacity);
  const p = clamp(percent / 100);
  const dash = CIRC * p;

  // Color logic
  const ring =
    percent >= 85
      ? "#e53935" // Red
      : percent >= 60
      ? "#fb8c00" // Orange
      : "#43a047"; // Green

  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: "center", alignItems: "center" }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="#E0E0E0"
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Progress Ring */}
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

      {/* Percentage Text */}
      <Text
        style={{
          position: "absolute",
          fontSize: 10,
          fontWeight: "700",
          color: "#000",
        }}
      >
        {Math.round(percent)}%
      </Text>
    </View>
  );
}
