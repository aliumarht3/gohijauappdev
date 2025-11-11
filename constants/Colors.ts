/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: "#2E7D32",
  primaryLight: "#81C784",
  bg: "#E8F5E9",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F8E9",
  border: "#E5E9EB",

  textPrimary: "#1F2937",
  textSecondary: "#5B6B73",

  success: "#2E7D32",
  warning: "#F59E0B",
  danger: "#EF4444",
  muted: "#9CA3AF",
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
