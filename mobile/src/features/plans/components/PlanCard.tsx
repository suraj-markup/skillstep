import type { Plan } from "@skillstep/shared";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface PlanCardProps {
  plan: Plan;
  progressPercent: number;
}

export function PlanCard({ plan, progressPercent }: PlanCardProps) {
  const Icon = planIcons[plan.icon];

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Current plan</Text>
      <View style={styles.cardTitleRow}>
        <View style={styles.iconBadge}>
          <Icon color={colors.action.primary} size={24} strokeWidth={2.4} />
        </View>
        <View style={styles.cardTitleStack}>
          <Text style={styles.cardTitle}>{plan.hobby}</Text>
          <Text style={styles.cardMeta}>
            {plan.techniques.length} techniques - {progressPercent}% mastered
          </Text>
        </View>
      </View>
      <Text style={styles.cardText}>{plan.rationale}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.techniqueList}>
        {plan.techniques.map((technique, index) => (
          <View key={technique.id} style={styles.techniqueRow}>
            <Text style={styles.techniqueNumber}>{index + 1}</Text>
            <View style={styles.techniqueTextStack}>
              <Text style={styles.techniqueName}>{technique.name}</Text>
              <Text style={styles.techniqueMeta}>
                {technique.drill.minutesPerSession} min - {technique.drill.sessionsPerWeek}x/week
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xl,
    padding: spacing.panel,
  },
  cardLabel: {
    color: colors.text.tertiary,
    fontSize: typography.overline.fontSize,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
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
  cardTitleStack: {
    flex: 1,
    gap: spacing.xxs,
  },
  cardTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    flexShrink: 1,
  },
  cardMeta: {
    color: colors.text.brand,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
  },
  cardText: {
    ...typography.bodyMedium,
    color: colors.text.body,
  },
  progressTrack: {
    backgroundColor: colors.surface.progressTrack,
    borderRadius: radius.pill,
    height: sizes.progressHeight,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: "100%",
  },
  techniqueList: {
    borderTopColor: colors.borders.divider,
    borderTopWidth: 1,
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  techniqueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xl,
    minHeight: 48,
  },
  techniqueNumber: {
    backgroundColor: colors.surface.techniqueBadge,
    borderRadius: radius.md,
    color: colors.text.tertiary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
    overflow: "hidden",
    paddingVertical: spacing.sm,
    textAlign: "center",
    width: sizes.techniqueIndex,
  },
  techniqueTextStack: {
    flex: 1,
    gap: spacing.xxs,
  },
  techniqueName: {
    ...typography.button,
    color: colors.text.primary,
  },
  techniqueMeta: {
    color: colors.techniqueMeta,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "600",
  },
});
