import type { Plan, Technique, TechniqueStatus, TechniqueUserState } from "@skillstep/shared";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Play,
  RotateCcw,
  SkipForward,
  Video,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface PlanDetailScreenProps {
  onBack: () => void;
  onSetTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  plan: Plan;
  progressPercent: number;
  states: Record<string, TechniqueUserState>;
}

export function PlanDetailScreen({
  onBack,
  onSetTechniqueStatus,
  plan,
  progressPercent,
  states,
}: PlanDetailScreenProps) {
  const Icon = planIcons[plan.icon];
  const [activeIndex, setActiveIndex] = useState(() => getFirstActiveIndex(plan, states));
  const position = useRef(new Animated.ValueXY()).current;
  const activeTechnique = plan.techniques[activeIndex];
  const activeState = activeTechnique ? (states[activeTechnique.id]?.status ?? "todo") : "todo";
  const masteredCount = plan.techniques.filter(
    (technique) => states[technique.id]?.status === "mastered",
  ).length;
  const completedCount = plan.techniques.filter((technique) =>
    ["mastered", "struck"].includes(states[technique.id]?.status ?? ""),
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

  const skipCurrentModule = useCallback(async () => {
    if (!activeTechnique) {
      return;
    }

    await onSetTechniqueStatus(activeTechnique.id, "struck");
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, plan.techniques.length - 1));
  }, [activeTechnique, onSetTechniqueStatus, plan.techniques.length]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: Animated.event([null, { dx: position.x }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 92) {
            Animated.timing(position, {
              duration: 160,
              toValue: { x: 420, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              position.setValue({ x: 0, y: 0 });
              void completeCurrentModule();
            });
            return;
          }

          Animated.spring(position, {
            friction: 6,
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [completeCurrentModule, position],
  );

  const cardRotation = position.x.interpolate({
    inputRange: [-160, 0, 160],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

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
          Card {activeIndex + 1} of {plan.techniques.length}
        </Text>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.flashCard,
            {
              transform: [{ translateX: position.x }, { rotate: cardRotation }],
            },
          ]}
        >
          <ModuleFlashCard status={activeState} technique={activeTechnique} />
        </Animated.View>
        <Text style={styles.swipeHint}>Swipe right when this module is done</Text>
      </View>

      <View style={styles.actionsPanel}>
        <View style={styles.cardActions}>
          <IconButton
            disabled={activeIndex === 0}
            icon="previous"
            label="Previous"
            onPress={() => setActiveIndex((index) => Math.max(0, index - 1))}
          />
          <IconButton
            icon="start"
            label={activeState === "in_progress" ? "Started" : "Start"}
            onPress={() => void onSetTechniqueStatus(activeTechnique.id, "in_progress")}
            tone="dark"
          />
          <IconButton
            icon="done"
            label="Done"
            onPress={() => void completeCurrentModule()}
            tone="dark"
          />
          <IconButton
            disabled={activeIndex === plan.techniques.length - 1}
            icon="next"
            label="Next"
            onPress={() =>
              setActiveIndex((index) => Math.min(plan.techniques.length - 1, index + 1))
            }
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void skipCurrentModule()}
          style={({ pressed }) => [styles.skipButton, pressed ? styles.pressed : undefined]}
        >
          <SkipForward color={colors.text.brand} size={16} strokeWidth={2.5} />
          <Text style={styles.skipButtonText}>Skip this module</Text>
        </Pressable>
      </View>

      <Text style={styles.completionText}>
        {completedCount} of {plan.techniques.length} cards cleared
      </Text>
    </ScrollView>
  );
}

function ModuleFlashCard({ status, technique }: { status: TechniqueStatus; technique: Technique }) {
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
        <Text numberOfLines={2} style={styles.masteryText}>
          {technique.masteryCriteria[0]?.text ?? "repeat the drill with control"}
        </Text>
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

function IconButton({
  disabled = false,
  icon,
  label,
  onPress,
  tone = "light",
}: {
  disabled?: boolean;
  icon: "done" | "next" | "previous" | "start";
  label: string;
  onPress: () => void;
  tone?: "dark" | "light";
}) {
  const Icon =
    icon === "previous"
      ? ChevronLeft
      : icon === "next"
        ? ChevronRight
        : icon === "done"
          ? Check
          : icon === "start"
            ? Play
            : RotateCcw;
  const isDark = tone === "dark";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconAction,
        isDark ? styles.iconActionDark : styles.iconActionLight,
        disabled ? styles.iconActionDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      <Icon color={isDark ? colors.text.inverse : colors.text.brand} size={16} strokeWidth={2.5} />
      <Text style={[styles.iconActionText, isDark ? styles.iconActionTextDark : undefined]}>
        {label}
      </Text>
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
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  cardInner: {
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  cardTitleStack: {
    gap: spacing.sm,
  },
  completionText: {
    color: colors.text.tertiary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "700",
    textAlign: "center",
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
    minHeight: 330,
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
  iconAction: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  iconActionDark: {
    backgroundColor: colors.surface.inverse,
  },
  iconActionDisabled: {
    opacity: 0.38,
  },
  iconActionLight: {
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderWidth: 1,
  },
  iconActionText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  iconActionTextDark: {
    color: colors.text.inverse,
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
  masteryText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
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
    gap: spacing.sm,
    padding: spacing.md,
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
  skipButton: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  skipButtonText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
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
  swipeHint: {
    color: colors.text.tertiary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "700",
  },
  title: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
});
