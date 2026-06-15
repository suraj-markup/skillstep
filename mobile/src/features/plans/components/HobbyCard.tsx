import type { PlanIcon } from "@skillstep/shared";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface HobbyCardProps {
  description: string;
  icon: PlanIcon;
  name: string;
  onPress: () => void;
}

export function HobbyCard({ description, icon, name, onPress }: HobbyCardProps) {
  const Icon = planIcons[icon];

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.hobbyCard}>
      <View style={styles.iconBadge}>
        <Icon color={colors.action.primary} size={22} strokeWidth={2.4} />
      </View>
      <View style={styles.hobbyCardTextStack}>
        <Text style={styles.hobbyCardTitle}>{name}</Text>
        <Text style={styles.hobbyCardDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hobbyCard: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xl,
    minHeight: 88,
    padding: spacing.xxl,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.md,
    borderWidth: 1,
    height: sizes.iconBadge,
    justifyContent: "center",
    width: sizes.iconBadge,
  },
  hobbyCardTextStack: {
    flex: 1,
    gap: spacing.xs,
  },
  hobbyCardTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: "800",
  },
  hobbyCardDescription: {
    ...typography.bodyMedium,
    color: colors.text.muted,
    fontSize: typography.labelMedium.fontSize,
  },
});
