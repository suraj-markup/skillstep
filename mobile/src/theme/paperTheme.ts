import { MD3LightTheme } from "react-native-paper";

import { colors } from "./colors";

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.background,
    error: colors.dangerTitle,
    errorContainer: colors.dangerWash,
    onBackground: colors.ink,
    onErrorContainer: colors.dangerText,
    onPrimary: colors.card,
    onPrimaryContainer: colors.sageText,
    onSecondaryContainer: colors.dangerText,
    onSurface: colors.ink,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    outlineVariant: colors.track,
    primary: colors.sage,
    primaryContainer: colors.sageWash,
    secondary: colors.clay,
    secondaryContainer: colors.dangerWash,
    surface: colors.card,
    surfaceVariant: "#fffaf1",
  },
} as const;
