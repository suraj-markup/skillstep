import type { PlanIcon } from "@skillstep/shared";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface HobbyCardProps {
  cardWidth?: number;
  completedModules?: number;
  description: string;
  icon: PlanIcon;
  moduleCount?: number;
  name: string;
  onPress: () => void;
  progressPercent?: number;
  variant?: "grid" | "rail";
}

type HobbyTone = keyof typeof colors.hobby;

const HOBBY_ICON_TONES: Partial<Record<PlanIcon, HobbyTone>> = {
  art: "rose",
  camera: "sky",
  cooking: "clay",
  fitness: "sage",
  guitar: "sun",
  sparkles: "sky",
  strategy: "sage",
};

const FEATURED_HOBBY_TONES: Record<string, HobbyTone> = {
  chess: "sage",
  cooking: "sun",
  cycling: "sage",
  drawing: "rose",
  fitness: "sage",
  guitar: "sun",
  photography: "sky",
  running: "rose",
  yoga: "sage",
};

export function HobbyCard({
  cardWidth,
  completedModules,
  description,
  icon,
  moduleCount,
  name,
  onPress,
  progressPercent,
  variant = "grid",
}: HobbyCardProps) {
  const Icon = planIcons[icon];
  const toneKey = HOBBY_ICON_TONES[icon] ?? "sage";
  const featuredToneKey = FEATURED_HOBBY_TONES[name.toLowerCase()];
  const tone = colors.hobby[featuredToneKey ?? toneKey];
  const isFeatured = Boolean(featuredToneKey);
  const hasPlan = progressPercent !== undefined;
  const shouldShowModules = hasPlan && moduleCount !== undefined && completedModules !== undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasPlan
          ? `${name}. ${progressPercent}% complete. ${description}`
          : `${name}. ${description}`
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.hobbyCard,
        variant === "rail" ? styles.hobbyCardRail : styles.hobbyCardGrid,
        cardWidth ? { width: cardWidth } : undefined,
        {
          backgroundColor: isFeatured ? tone.surface : colors.surface.card,
          borderColor: isFeatured ? tone.border : colors.borders.divider,
        },
        pressed ? styles.hobbyCardPressed : undefined,
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: isFeatured ? colors.surface.card : tone.surface },
        ]}
      >
        <Icon color={isFeatured ? colors.surface.inverse : tone.icon} size={20} strokeWidth={2.5} />
      </View>
      <Text numberOfLines={2} style={styles.hobbyCardTitle}>
        {name}
      </Text>
      {hasPlan ? (
        <View style={styles.progressStack}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {shouldShowModules
              ? `${completedModules}/${moduleCount} modules`
              : `${progressPercent}%`}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hobbyCard: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    justifyContent: "center",
    minHeight: 104,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  hobbyCardGrid: {
    flexBasis: "30.5%",
    flexGrow: 1,
  },
  hobbyCardRail: {
    flexGrow: 0,
  },
  hobbyCardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  iconBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: sizes.iconBadge - 4,
    justifyContent: "center",
    width: sizes.iconBadge - 4,
  },
  hobbyCardTitle: {
    ...typography.labelMedium,
    color: colors.text.primary,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  progressStack: {
    alignSelf: "stretch",
    gap: spacing.xs,
  },
  progressTrack: {
    backgroundColor: colors.surface.progressTrack,
    borderRadius: radius.pill,
    height: 5,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    height: "100%",
  },
  progressText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 13,
    textAlign: "center",
  },
});
