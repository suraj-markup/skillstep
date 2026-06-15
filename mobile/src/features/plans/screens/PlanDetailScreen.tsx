import type {
  Plan,
  ResolveTechniqueContentInput,
  Technique,
  TechniqueContent,
  TechniqueStatus,
  TechniqueUserState,
  VideoResource,
} from "@skillstep/shared";
import { isPlanComplete } from "@skillstep/shared";
import { ArrowLeft, Check, Clock3, ExternalLink, MoveLeft, MoveRight } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { WebView } from "react-native-webview";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { successFeedback, tapFeedback, warningFeedback } from "../../../utils/haptics";
import { planIcons } from "../planIcons";

const YOUTUBE_EMBED_REFERER = "https://skillstep.app/";

interface PlanDetailScreenProps {
  onBack: () => void;
  onLoadTechniqueContent: (
    techniqueId: string,
    input: ResolveTechniqueContentInput,
  ) => Promise<void>;
  onSetTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  onToggleCriterion: (criterionId: string) => Promise<void>;
  plan: Plan;
  progressPercent: number;
  states: Record<string, TechniqueUserState>;
  techniqueContentById: Record<string, TechniqueContent>;
  techniqueContentLoadingById: Record<string, boolean>;
}

export function PlanDetailScreen({
  onBack,
  onLoadTechniqueContent,
  onSetTechniqueStatus,
  onToggleCriterion,
  plan,
  progressPercent,
  states,
  techniqueContentById,
  techniqueContentLoadingById,
}: PlanDetailScreenProps) {
  const Icon = planIcons[plan.icon];
  const [activeIndex, setActiveIndex] = useState(() => getFirstActiveIndex(plan, states));
  const [achievementNotice, setAchievementNotice] = useState<AchievementNoticeState | null>(null);
  const progressValue = useSharedValue(progressPercent);
  const activeTechnique = plan.techniques[activeIndex];
  const activeState = activeTechnique ? (states[activeTechnique.id]?.status ?? "todo") : "todo";
  const activeCheckedCriteria = activeTechnique
    ? (states[activeTechnique.id]?.checkedCriteria ?? [])
    : [];
  const isPracticeCompletionReady = activeTechnique
    ? hasCheckedAllCriteria(activeTechnique, activeCheckedCriteria)
    : false;
  const isPracticeCompletionDisabled = activeState === "mastered" || !isPracticeCompletionReady;
  const activeContent = activeTechnique ? techniqueContentById[activeTechnique.id] : undefined;
  const isActiveContentLoading = activeTechnique
    ? (techniqueContentLoadingById[activeTechnique.id] ?? false)
    : false;
  const masteredCount = plan.techniques.filter(
    (technique) => states[technique.id]?.status === "mastered",
  ).length;
  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  useEffect(() => {
    progressValue.value = withTiming(progressPercent, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressPercent, progressValue]);

  useEffect(() => {
    if (!achievementNotice || achievementNotice.kind === "plan") {
      return;
    }

    const timeout = setTimeout(() => setAchievementNotice(null), 3200);
    return () => clearTimeout(timeout);
  }, [achievementNotice]);

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

    const checkedCriteria = states[activeTechnique.id]?.checkedCriteria ?? [];
    if (!hasCheckedAllCriteria(activeTechnique, checkedCriteria)) {
      await warningFeedback();
      return;
    }

    await successFeedback();
    await onSetTechniqueStatus(activeTechnique.id, "mastered");
    const nextStates = {
      ...states,
      [activeTechnique.id]: {
        checkedCriteria: states[activeTechnique.id]?.checkedCriteria ?? [],
        status: "mastered" as const,
      },
    };
    const nextProgress = computeLocalProgress(plan, nextStates);
    const planIsComplete = isPlanComplete(nextProgress);

    setAchievementNotice({
      body: planIsComplete
        ? `You completed the ${plan.hobby} level jump. Your next path is ready when you are.`
        : "Nice. Keep the momentum going with the next smallest useful practice step.",
      kind: planIsComplete ? "plan" : "module",
      title: planIsComplete ? "Goal achieved" : `${activeTechnique.name} is complete`,
    });
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, plan.techniques.length - 1));
  }, [activeTechnique, onSetTechniqueStatus, plan, states]);

  useEffect(() => {
    if (!activeTechnique) {
      return;
    }

    void onLoadTechniqueContent(activeTechnique.id, {
      drillText: activeTechnique.drill.text,
      hobby: plan.hobby,
      techniqueName: activeTechnique.name,
    });
  }, [activeTechnique, onLoadTechniqueContent, plan.hobby]);

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
          <Animated.View style={[styles.progressFill, progressFillStyle]} />
        </View>
      </View>

      {achievementNotice ? (
        <AchievementNotice
          body={achievementNotice.body}
          kind={achievementNotice.kind}
          onDismiss={() => setAchievementNotice(null)}
          title={achievementNotice.title}
        />
      ) : null}

      <View style={styles.deckArea}>
        <Text style={styles.deckCounter}>
          Module {activeIndex + 1} of {plan.techniques.length}
        </Text>
        <Animated.View
          entering={FadeInRight.duration(260).easing(Easing.out(Easing.cubic))}
          key={activeTechnique.id}
          style={styles.flashCard}
        >
          <ModuleFlashCard
            checkedCriteria={activeCheckedCriteria}
            content={activeContent}
            isContentLoading={isActiveContentLoading}
            onToggleCriterion={onToggleCriterion}
            status={activeState}
            technique={activeTechnique}
          />
        </Animated.View>
      </View>

      <View style={styles.actionsPanel}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isPracticeCompletionDisabled }}
          disabled={isPracticeCompletionDisabled}
          onPress={() => void completeCurrentModule()}
          style={({ pressed }) => [
            styles.primaryAction,
            isPracticeCompletionDisabled ? styles.primaryActionDisabled : undefined,
            pressed && !isPracticeCompletionDisabled ? styles.pressed : undefined,
          ]}
        >
          <Check color={colors.text.inverse} size={18} strokeWidth={2.8} />
          <Text style={styles.primaryActionText}>
            {activeState === "mastered" ? "Practice completed" : "Mark practice complete"}
          </Text>
        </Pressable>
        {activeState !== "mastered" && !isPracticeCompletionReady ? (
          <Text style={styles.completionHint}>
            Check all mastery criteria before completing this module.
          </Text>
        ) : null}

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

type AchievementNoticeState = {
  body: string;
  kind: "module" | "plan";
  title: string;
};

function AchievementNotice({
  body,
  kind,
  onDismiss,
  title,
}: AchievementNoticeState & { onDismiss: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16).stiffness(180)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.achievementPanel, kind === "plan" ? styles.achievementPanelComplete : null]}
    >
      <View style={styles.achievementIcon}>
        <Check color={colors.text.inverse} size={22} strokeWidth={3} />
      </View>
      <View style={styles.achievementCopy}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementBody}>{body}</Text>
      </View>
      <Pressable accessibilityRole="button" hitSlop={10} onPress={onDismiss}>
        <Text style={styles.achievementDismiss}>OK</Text>
      </Pressable>
    </Animated.View>
  );
}

function ModuleFlashCard({
  checkedCriteria,
  content,
  isContentLoading,
  onToggleCriterion,
  status,
  technique,
}: {
  checkedCriteria: string[];
  content?: TechniqueContent;
  isContentLoading: boolean;
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
        <Text style={styles.moduleWhy}>{technique.whyItMatters}</Text>
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

      <RecommendedVideosSection content={content} isLoading={isContentLoading} />

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
              onPress={() => {
                void tapFeedback();
                void onToggleCriterion(criterion.id);
              }}
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

function RecommendedVideosSection({
  content,
  isLoading,
}: {
  content?: TechniqueContent;
  isLoading: boolean;
}) {
  const videos = content?.videos ?? [];
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const selectedVideo = videos.find((video) => video.videoId === selectedVideoId) ?? null;

  useEffect(() => {
    if (selectedVideoId && !videos.some((video) => video.videoId === selectedVideoId)) {
      setSelectedVideoId(null);
    }
  }, [selectedVideoId, videos]);

  if (!isLoading && videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.videosBox}>
      <View style={styles.videosHeaderRow}>
        <Text style={styles.videosTitle}>Recommended videos</Text>
        {isLoading ? <ActivityIndicator color={colors.action.primary} size="small" /> : null}
      </View>

      {videos.length > 0 ? (
        <>
          {selectedVideo ? <InlineYouTubePlayer video={selectedVideo} /> : null}
          <View style={styles.videoList}>
            {videos.map((video) => (
              <VideoResourceRow
                isSelected={video.videoId === selectedVideoId}
                key={video.videoId}
                onSelect={() => setSelectedVideoId(video.videoId)}
                video={video}
              />
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.videoEmptyText}>Finding useful YouTube videos...</Text>
      )}
    </View>
  );
}

function InlineYouTubePlayer({ video }: { video: VideoResource }) {
  return (
    <View style={styles.inlinePlayerShell}>
      <WebView
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        domStorageEnabled
        javaScriptEnabled
        mediaPlaybackRequiresUserAction
        source={{
          headers: {
            Referer: YOUTUBE_EMBED_REFERER,
          },
          uri: buildYouTubeEmbedUrl(video.videoId),
        }}
        style={styles.inlinePlayer}
      />
    </View>
  );
}

function VideoResourceRow({
  isSelected,
  onSelect,
  video,
}: {
  isSelected: boolean;
  onSelect: () => void;
  video: VideoResource;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.videoRow,
        isSelected ? styles.videoRowSelected : undefined,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <YouTubeLogo />
      <Text numberOfLines={1} style={styles.videoTitle}>
        {video.title} · {video.channelTitle} · {formatDuration(video.durationSec)}
      </Text>
      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${video.videoId}`)}
      >
        <ExternalLink color={colors.text.tertiary} size={16} strokeWidth={2.4} />
      </Pressable>
    </Pressable>
  );
}

function YouTubeLogo() {
  return (
    <View style={styles.youtubeLogo}>
      <View style={styles.youtubePlayTriangle} />
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

function hasCheckedAllCriteria(technique: Technique, checkedCriteria: string[]) {
  if (technique.masteryCriteria.length === 0) {
    return false;
  }

  const checkedCriteriaSet = new Set(checkedCriteria);
  return technique.masteryCriteria.every((criterion) => checkedCriteriaSet.has(criterion.id));
}

function computeLocalProgress(plan: Plan, states: Record<string, TechniqueUserState>) {
  let struck = 0;
  let mastered = 0;
  let inProgress = 0;

  for (const technique of plan.techniques) {
    const status = states[technique.id]?.status ?? "todo";
    if (status === "struck") struck += 1;
    else if (status === "mastered") mastered += 1;
    else if (status === "in_progress") inProgress += 1;
  }

  const total = plan.techniques.length;
  const active = total - struck;
  const percent = active === 0 ? 0 : Math.round((mastered / active) * 100);

  return { active, inProgress, mastered, percent, struck, total };
}

function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

const statusLabel: Record<TechniqueStatus, string> = {
  in_progress: "In practice",
  mastered: "Completed",
  struck: "Skipped",
  todo: "Not started",
};

const styles = StyleSheet.create({
  achievementBody: {
    ...typography.bodySmall,
    color: colors.text.body,
  },
  achievementCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  achievementDismiss: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "900",
  },
  achievementIcon: {
    alignItems: "center",
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  achievementPanel: {
    alignItems: "center",
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.success,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  achievementPanelComplete: {
    backgroundColor: colors.surface.successSoft,
  },
  achievementTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 20,
  },
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
  completionHint: {
    ...typography.bodySmall,
    color: colors.text.muted,
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
    padding: spacing.panel,
    width: "100%",
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
  inlinePlayer: {
    backgroundColor: colors.surface.inverse,
    flex: 1,
  },
  inlinePlayerShell: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.lg,
    overflow: "hidden",
    width: "100%",
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
  videoEmptyText: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  videoList: {
    gap: spacing.xs,
  },
  videoRow: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  videoRowSelected: {
    borderColor: colors.action.primary,
  },
  videosBox: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  videosHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  videosTitle: {
    color: colors.text.primary,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: "900",
  },
  videoTitle: {
    color: colors.text.primary,
    flex: 1,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  youtubeLogo: {
    alignItems: "center",
    backgroundColor: "#ff0033",
    borderRadius: 7,
    height: 22,
    justifyContent: "center",
    width: 30,
  },
  youtubePlayTriangle: {
    borderBottomColor: "transparent",
    borderBottomWidth: 5,
    borderLeftColor: colors.text.inverse,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderTopWidth: 5,
    height: 0,
    marginLeft: 2,
    width: 0,
  },
});
