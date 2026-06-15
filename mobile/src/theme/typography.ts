import type { TextStyle } from "react-native";

type TypographyToken =
  | "displayLarge"
  | "displayMedium"
  | "displaySmall"
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  | "labelLarge"
  | "labelMedium"
  | "labelSmall"
  | "button"
  | "overline";

export const typography: Record<TypographyToken, TextStyle> = {
  displayLarge: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
  },
  displayMedium: {
    fontSize: 37,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
  },
  displaySmall: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  titleLarge: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: "800",
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: "800",
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 25,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 23,
  },
  bodySmall: {
    fontSize: 15,
    lineHeight: 22,
  },
  labelLarge: {
    fontSize: 16,
    fontWeight: "800",
  },
  labelMedium: {
    fontSize: 14,
    fontWeight: "800",
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: "800",
  },
  button: {
    fontSize: 16,
    fontWeight: "800",
  },
  overline: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
} as const;
