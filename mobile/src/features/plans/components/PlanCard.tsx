import type { Plan } from "@skillstep/shared";
import { Clock3, ListChecks, Target } from "lucide-react-native";
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
  const nextTechnique = plan.techniques[0];

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <View style={styles.iconBadge}>
          <Icon color={colors.action.primary} size={24} strokeWidth={2.4} />
        </View>
        <View style={styles.cardTitleStack}>
          <Text style={styles.cardLabel}>Current plan</Text>
          <Text style={styles.cardTitle}>{plan.hobby}</Text>
          <Text style={styles.cardMeta}>{progressPercent}% mastered</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {nextTechnique ? (
        <View style={styles.nextFocusPanel}>
          <View style={styles.nextFocusIcon}>
            <Target color={colors.text.inverse} size={18} strokeWidth={2.5} />
          </View>
          <View style={styles.nextFocusTextStack}>
            <Text style={styles.nextFocusLabel}>Next focus</Text>
            <Text numberOfLines={2} style={styles.nextFocusTitle}>
              {nextTechnique.name}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.snapshotRow}>
        <View style={styles.snapshotPill}>
          <ListChecks color={colors.text.brand} size={16} strokeWidth={2.4} />
          <Text style={styles.snapshotText}>{plan.techniques.length} skills</Text>
        </View>
        {nextTechnique ? (
          <View style={styles.snapshotPill}>
            <Clock3 color={colors.text.brand} size={16} strokeWidth={2.4} />
            <Text style={styles.snapshotText}>{nextTechnique.drill.minutesPerSession} min</Text>
          </View>
        ) : null}
      </View>

      <Text numberOfLines={2} style={styles.cardText}>
        {plan.rationale}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.xl,
    padding: spacing.panel + 2,
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
    borderRadius: radius.pill,
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
    height: sizes.progressHeight + 2,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: "100%",
  },
  nextFocusPanel: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  nextFocusIcon: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  nextFocusTextStack: {
    flex: 1,
    gap: spacing.xxs,
  },
  nextFocusLabel: {
    ...typography.overline,
    color: colors.track,
  },
  nextFocusTitle: {
    color: colors.text.inverse,
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: "800",
    lineHeight: 22,
  },
  snapshotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  snapshotPill: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  snapshotText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
});
