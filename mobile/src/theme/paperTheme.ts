import { MD3LightTheme } from "react-native-paper";

import { colors } from "./colors";
import { radius } from "./radius";

export const paperTheme = {
  ...MD3LightTheme,
  roundness: radius.sm,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.surface.app,
    error: colors.feedback.dangerTitle,
    errorContainer: colors.feedback.dangerBackground,
    onBackground: colors.text.primary,
    onErrorContainer: colors.feedback.dangerText,
    onPrimary: colors.action.primaryText,
    onPrimaryContainer: colors.text.success,
    onSecondaryContainer: colors.feedback.dangerText,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.muted,
    outline: colors.borders.default,
    outlineVariant: colors.surface.progressTrack,
    primary: colors.action.primary,
    primaryContainer: colors.surface.successSoft,
    secondary: colors.text.accent,
    secondaryContainer: colors.feedback.dangerBackground,
    surface: colors.surface.card,
    surfaceVariant: colors.surface.input,
  },
} as const;
