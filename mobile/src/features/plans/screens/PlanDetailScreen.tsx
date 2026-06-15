import type { Plan, Technique, TechniqueStatus, TechniqueUserState } from "@skillstep/shared";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock3,
  Dumbbell,
  MoveLeft,
  MoveRight,
  Video,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface PlanDetailScreenProps {
  onBack: () => void;
  onSetTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  onToggleCriterion: (criterionId: string) => Promise<void>;
  plan: Plan;
  progressPercent: number;
  states: Record<string, TechniqueUserState>;
}

export function PlanDetailScreen({
  onBack,
  onSetTechniqueStatus,
  onToggleCriterion,
  plan,
  progressPercent,
  states,
}: PlanDetailScreenProps) {
  const Icon = planIcons[plan.icon];
  const [activeIndex, setActiveIndex] = useState(() => getFirstActiveIndex(plan, states));
  const activeTechnique = plan.techniques[activeIndex];
  const activeState = activeTechnique ? (states[activeTechnique.id]?.status ?? "todo") : "todo";
  const activeCheckedCriteria = activeTechnique
    ? (states[activeTechnique.id]?.checkedCriteria ?? [])
    : [];
  const masteredCount = plan.techniques.filter(
    (technique) => states[technique.id]?.status === "mastered",
  ).length;

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      const currentTechnique = plan.techniques[currentIndex];
      const currentStatus = currentTechnique ? states[currentTechnique.id]?.status : undefined;
      if (currentTechnique && currentStatus !== "mastered" && currentStatus !== "struck") {
        return currentIndex;
      }

      return getFirstActiveIndex(plan, states);
    });
  }, [plan, states]);

  const completeCurrentModule = useCallback(async () => {
    if (!activeTechnique) {
      return;
    }

    await onSetTechniqueStatus(activeTechnique.id, "mastered");
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, plan.techniques.length - 1));
  }, [activeTechnique, onSetTechniqueStatus, plan.techniques.length]);

  if (!activeTechnique) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
        <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <View style={styles.headerPanel}>
        <View style={styles.headerTopRow}>
          <View style={styles.iconBadge}>
            <Icon color={colors.action.primary} size={25} strokeWidth={2.5} />
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{progressPercent}%</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>Learning path</Text>
        <Text style={styles.title}>{plan.hobby}</Text>
        <Text style={styles.subtitle}>
          {masteredCount}/{plan.techniques.length} modules complete
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.deckArea}>
        <Text style={styles.deckCounter}>
          Module {activeIndex + 1} of {plan.techniques.length}
        </Text>
        <View style={styles.flashCard}>
          <ModuleFlashCard
            checkedCriteria={activeCheckedCriteria}
            onToggleCriterion={onToggleCriterion}
            status={activeState}
            technique={activeTechnique}
          />
        </View>
      </View>

      <View style={styles.actionsPanel}>
        <Pressable
          accessibilityRole="button"
          disabled={activeState === "mastered"}
          onPress={() => void completeCurrentModule()}
          style={({ pressed }) => [
            styles.primaryAction,
            activeState === "mastered" ? styles.primaryActionDisabled : undefined,
            pressed && activeState !== "mastered" ? styles.pressed : undefined,
          ]}
        >
          <Check color={colors.text.inverse} size={18} strokeWidth={2.8} />
          <Text style={styles.primaryActionText}>
            {activeState === "mastered" ? "Practice completed" : "Mark practice complete"}
          </Text>
        </Pressable>

        <View style={styles.cardActions}>
          <NavigationButton
            disabled={activeIndex === 0}
            direction="previous"
            label="Previous module"
            onPress={() => setActiveIndex((index) => Math.max(0, index - 1))}
          />
          <NavigationButton
            disabled={activeIndex === plan.techniques.length - 1}
            direction="next"
            label="Next module"
            onPress={() =>
              setActiveIndex((index) => Math.min(plan.techniques.length - 1, index + 1))
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ModuleFlashCard({
  checkedCriteria,
  onToggleCriterion,
  status,
  technique,
}: {
  checkedCriteria: string[];
  onToggleCriterion: (criterionId: string) => Promise<void>;
  status: TechniqueStatus;
  technique: Technique;
}) {
  return (
    <View style={styles.cardInner}>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{statusLabel[status]}</Text>
      </View>

      <View style={styles.cardTitleStack}>
        <Text style={styles.moduleTitle}>{technique.name}</Text>
        <Text numberOfLines={3} style={styles.moduleWhy}>
          {technique.whyItMatters}
        </Text>
      </View>

      <View style={styles.drillPanel}>
        <View style={styles.drillMetaRow}>
          <Clock3 color={colors.text.brand} size={16} strokeWidth={2.4} />
          <Text style={styles.drillMeta}>
            {technique.drill.minutesPerSession} min, {technique.drill.sessionsPerWeek}x/week
          </Text>
        </View>
        <Text numberOfLines={4} style={styles.drillText}>
          {technique.drill.text}
        </Text>
      </View>

      <View style={styles.formatRow}>
        <FormatPill icon="video" label="Watch" value={technique.modalityProfile.video} />
        <FormatPill icon="read" label="Read" value={technique.modalityProfile.reading} />
        <FormatPill icon="practice" label="Do" value={technique.modalityProfile.practice} />
      </View>

      <View style={styles.masteryBox}>
        <Text style={styles.masteryLabel}>You are done when you can:</Text>
        <View style={styles.masteryList}>
          {(technique.masteryCriteria.length > 0
            ? technique.masteryCriteria
            : [{ id: "fallback", text: "repeat the drill with control" }]
          ).map((criterion) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checkedCriteria.includes(criterion.id) }}
              disabled={criterion.id === "fallback"}
              key={criterion.id}
              onPress={() => void onToggleCriterion(criterion.id)}
              style={({ pressed }) => [
                styles.masteryItem,
                pressed && criterion.id !== "fallback" ? styles.pressed : undefined,
              ]}
            >
              <View
                style={[
                  styles.masteryCheckbox,
                  checkedCriteria.includes(criterion.id)
                    ? styles.masteryCheckboxChecked
                    : undefined,
                ]}
              >
                {checkedCriteria.includes(criterion.id) ? (
                  <Check color={colors.text.inverse} size={13} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.masteryText}>{criterion.text}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function FormatPill({
  icon,
  label,
  value,
}: {
  icon: "practice" | "read" | "video";
  label: string;
  value: "none" | "primary" | "supporting";
}) {
  const Icon = icon === "video" ? Video : icon === "read" ? BookOpen : Dumbbell;
  const isPrimary = value === "primary";

  return (
    <View style={[styles.formatPill, isPrimary ? styles.formatPillPrimary : undefined]}>
      <Icon
        color={isPrimary ? colors.text.inverse : colors.text.brand}
        size={14}
        strokeWidth={2.4}
      />
      <Text style={[styles.formatText, isPrimary ? styles.formatTextPrimary : undefined]}>
        {label}
      </Text>
    </View>
  );
}

function NavigationButton({
  disabled = false,
  direction,
  label,
  onPress,
}: {
  disabled?: boolean;
  direction: "next" | "previous";
  label: string;
  onPress: () => void;
}) {
  const Icon = direction === "previous" ? MoveLeft : MoveRight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationAction,
        disabled ? styles.navigationActionDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      <Icon color={colors.text.brand} size={16} strokeWidth={2.5} />
      <Text style={styles.navigationActionText}>{label}</Text>
    </Pressable>
  );
}

function getFirstActiveIndex(plan: Plan, states: Record<string, TechniqueUserState>) {
  const activeIndex = plan.techniques.findIndex((technique) => {
    const status = states[technique.id]?.status;
    return status !== "mastered" && status !== "struck";
  });

  return activeIndex === -1 ? 0 : activeIndex;
}

const statusLabel: Record<TechniqueStatus, string> = {
  in_progress: "In practice",
  mastered: "Completed",
  struck: "Skipped",
  todo: "Not started",
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.xl,
  },
  backButtonText: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  cardInner: {
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  cardTitleStack: {
    gap: spacing.sm,
  },
  container: {
    backgroundColor: colors.surface.card,
    gap: spacing.panel,
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  deckArea: {
    alignItems: "center",
    gap: spacing.lg,
    justifyContent: "center",
  },
  deckCounter: {
    color: colors.text.tertiary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  drillMeta: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  drillMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  drillPanel: {
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  drillText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  eyebrow: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  flashCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 32,
    borderWidth: 1,
    padding: spacing.panel,
    width: "100%",
  },
  formatPill: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  formatPillPrimary: {
    backgroundColor: colors.surface.inverse,
    borderColor: colors.surface.inverse,
  },
  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  formatText: {
    color: colors.text.brand,
    fontSize: 11,
    fontWeight: "800",
  },
  formatTextPrimary: {
    color: colors.text.inverse,
  },
  headerPanel: {
    backgroundColor: colors.surface.successSoft,
    borderRadius: 32,
    gap: spacing.lg,
    padding: spacing.panel,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: sizes.iconCircle,
    justifyContent: "center",
    width: sizes.iconCircle,
  },
  masteryBox: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  masteryLabel: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  masteryList: {
    gap: spacing.sm,
  },
  masteryItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 28,
  },
  masteryCheckbox: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 7,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    marginTop: 1,
    width: 22,
  },
  masteryCheckboxChecked: {
    backgroundColor: colors.action.primary,
    borderColor: colors.action.primary,
  },
  masteryText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    fontWeight: "700",
  },
  moduleTitle: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 31,
  },
  moduleWhy: {
    ...typography.bodyMedium,
    color: colors.text.body,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  actionsPanel: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  navigationAction: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  navigationActionDisabled: {
    opacity: 0.38,
  },
  navigationActionText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "900",
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    width: "100%",
  },
  primaryActionDisabled: {
    opacity: 0.72,
  },
  primaryActionText: {
    color: colors.text.inverse,
    fontSize: typography.button.fontSize,
    fontWeight: "900",
  },
  progressBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  progressBadgeText: {
    color: colors.text.brand,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: "900",
  },
  progressFill: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: "100%",
  },
  progressTrack: {
    backgroundColor: colors.surface.progressTrack,
    borderRadius: radius.pill,
    height: sizes.progressHeight + 2,
    overflow: "hidden",
  },
  secondaryAction: {
    padding: spacing.sm,
  },
  secondaryActionText: {
    color: colors.text.tertiary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "900",
    textAlign: "center",
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  statusText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "900",
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
});
