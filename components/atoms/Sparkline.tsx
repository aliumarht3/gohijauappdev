import { Colors } from "@/constants/Colors";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
export default function Sparkline({
    values,
    width = 120,
    height = 40,
}: {
    values: number[];
    width?: number;
    height?: number;
}) {
    if (!values || values.length < 2) return <View style={{ width, height }} />;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const rng = Math.max(1, max - min);
    const step = width / (values.length - 1);

    const pts = values
        .map((v, i) => {
            const x = i * step;
            const y = height - ((v - min) / rng) * height;
            return `${x},${y}`;
        })
        .join(" ");

    const d = `M ${pts.replace(" ", " L ")}`;

    return <Svg width={width} height={height}><Path d={d} stroke={Colors.primaryLight} strokeWidth={2} fill="none" /></Svg>;
}
