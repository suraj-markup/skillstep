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

const HOBBY_ICON_TONES: Record<PlanIcon, HobbyTone> = {
  art: "rose",
  book: "sage",
  camera: "sky",
  cards: "sage",
  cars: "clay",
  coffee: "clay",
  content: "sky",
  cooking: "clay",
  cycling: "sage",
  dance: "rose",
  design: "rose",
  fitness: "sage",
  gaming: "sky",
  gardening: "sage",
  guitar: "sun",
  language: "sky",
  music: "rose",
  reading: "sage",
  running: "clay",
  singing: "rose",
  sparkles: "sky",
  sports: "clay",
  swimming: "sky",
  strategy: "sage",
  tennis: "sun",
  travel: "sky",
  video: "sky",
  writing: "sun",
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
  const tone = colors.hobby[HOBBY_ICON_TONES[icon]];
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
          backgroundColor: colors.surface.card,
          borderColor: colors.borders.divider,
        },
        pressed ? styles.hobbyCardPressed : undefined,
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: tone.surface, borderColor: tone.border }]}>
        <Icon color={tone.icon} size={20} strokeWidth={2.5} />
      </View>
      <Text numberOfLines={2} style={styles.hobbyCardTitle}>
        {name}
      </Text>
      {hasPlan ? (
        <View style={styles.progressStack}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: tone.icon, width: `${progressPercent}%` },
              ]}
            />
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
    borderWidth: 1,
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
