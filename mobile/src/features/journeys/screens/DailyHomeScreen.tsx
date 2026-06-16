import {
  type CardDifficulty,
  type DailySession,
  type GenerateJourneyInput,
  GenerateJourneyInputSchema,
  type HobbyProfile,
  type PracticeCard,
} from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, BookOpenCheck, Check, Clock3, Plus, Sparkles } from "lucide-react-native";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getUserProfile, saveUserProfile, type UserProfile } from "../../../db";
import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { successFeedback, tapFeedback } from "../../../utils/haptics";
import { OnboardingScreen } from "../../onboarding/screens/OnboardingScreen";
import { DEFAULT_HOBBIES, type DefaultHobby } from "../defaultHobbies";
import { hobbyIcons } from "../hobbyIcons";
import { useDailyJourneys } from "../useDailyJourneys";

type ScreenMode = "today" | "setup" | "session" | "review";
type SessionResource = NonNullable<DailySession["resource"]>;

export function DailyHomeScreen() {
  const {
    dueCards,
    errorMessage,
    generateJourney,
    hobbyProfiles,
    isGenerating,
    isLoading,
    reviewCard,
    saveReflection,
    todaySessions,
    updateSessionStatus,
  } = useDailyJourneys();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [mode, setMode] = useState<ScreenMode>("today");
  const [activeSession, setActiveSession] = useState<DailySession | null>(null);
  const [setupHobby, setSetupHobby] = useState<DefaultHobby | null>(null);
  const [hasSkippedFirstHobbySetup, setHasSkippedFirstHobbySetup] = useState(false);
  const hasNoHobbies = profile !== null && hobbyProfiles.length === 0;
  const isFirstHobbyRequired = hasNoHobbies && !hasSkippedFirstHobbySetup;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const savedProfile = await getUserProfile();
        if (isMounted) setProfile(savedProfile);
      } finally {
        if (isMounted) setIsProfileLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function completeOnboarding(name: string) {
    const savedProfile = await saveUserProfile(name);
    setProfile(savedProfile);
    setHasSkippedFirstHobbySetup(false);
    setSetupHobby(null);
    setMode("setup");
  }

  async function openSession(session: DailySession) {
    await tapFeedback();
    if (session.status === "available" || session.status === "missed") {
      await updateSessionStatus(session.id, "in_progress");
      setActiveSession({ ...session, status: "in_progress" });
    } else {
      setActiveSession(session);
    }
    setMode("session");
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFirstHobbyRequired) {
        return true;
      }

      if (mode === "today") {
        return false;
      }

      setActiveSession(null);
      setSetupHobby(null);
      setMode("today");
      return true;
    });

    return () => subscription.remove();
  }, [isFirstHobbyRequired, mode]);

  if (isProfileLoading || isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.action.primary} />
      </ScrollView>
    );
  }

  if (!profile) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (mode === "setup" || isFirstHobbyRequired) {
    return (
      <JourneySetupScreen
        canGoBack={!isFirstHobbyRequired}
        canSkip={isFirstHobbyRequired}
        errorMessage={errorMessage}
        initialHobby={setupHobby}
        isFirstHobby={hasNoHobbies}
        isGenerating={isGenerating}
        onBack={() => {
          if (isFirstHobbyRequired) {
            return;
          }

          setSetupHobby(null);
          setMode("today");
        }}
        onSkip={() => {
          setHasSkippedFirstHobbySetup(true);
          setSetupHobby(null);
          setMode("today");
        }}
        onSubmit={async (input) => {
          const didGenerate = await generateJourney(input);
          if (didGenerate) {
            setHasSkippedFirstHobbySetup(false);
            setSetupHobby(null);
            setMode("today");
          }
        }}
      />
    );
  }

  if (mode === "session" && activeSession) {
    return (
      <SessionDetailScreen
        onBack={() => setMode("today")}
        onComplete={async (notes) => {
          await successFeedback();
          await saveReflection({
            id: `reflection-${activeSession.id}-${Date.now()}`,
            sessionId: activeSession.id,
            hobbyProfileId: activeSession.hobbyProfileId,
            journeyId: activeSession.journeyId,
            difficulty: "right",
            notes,
            feltEasy: null,
            feltHard: notes,
            shouldRevisit: false,
            createdAt: new Date().toISOString(),
          });
          await updateSessionStatus(activeSession.id, "completed");
          setActiveSession(null);
          setMode("today");
        }}
        session={activeSession}
      />
    );
  }

  if (mode === "review") {
    return (
      <ReviewScreen cards={dueCards} onBack={() => setMode("today")} onReviewCard={reviewCard} />
    );
  }

  return (
    <TodayScreen
      errorMessage={errorMessage}
      hobbyProfiles={hobbyProfiles}
      onAddHobby={() => {
        setSetupHobby(null);
        setMode("setup");
      }}
      onOpenSession={openSession}
      onSelectPopularHobby={(hobby) => {
        setSetupHobby(hobby);
        setMode("setup");
      }}
      profile={profile}
      todaySessions={todaySessions}
    />
  );
}

function TodayScreen({
  errorMessage,
  hobbyProfiles,
  onAddHobby,
  onOpenSession,
  onSelectPopularHobby,
  profile,
  todaySessions,
}: {
  errorMessage: string | null;
  hobbyProfiles: HobbyProfile[];
  onAddHobby: () => void;
  onOpenSession: (session: DailySession) => Promise<void>;
  onSelectPopularHobby: (hobby: DefaultHobby) => void;
  profile: UserProfile;
  todaySessions: DailySession[];
}) {
  const profilesById = useMemo(
    () => new Map(hobbyProfiles.map((hobbyProfile) => [hobbyProfile.id, hobbyProfile])),
    [hobbyProfiles],
  );
  const existingHobbyNames = useMemo(
    () => new Set(hobbyProfiles.map((hobbyProfile) => normalizeHobbyName(hobbyProfile.name))),
    [hobbyProfiles],
  );
  const popularHobbies = useMemo(
    () =>
      DEFAULT_HOBBIES.filter(
        (hobby) => !existingHobbyNames.has(normalizeHobbyName(hobby.name)),
      ).slice(0, 9),
    [existingHobbyNames],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.heroPanel}>
        <Sparkles color={colors.surface.card} size={54} strokeWidth={1.8} style={styles.heroIcon} />
        <Text style={styles.eyebrow}>Welcome,</Text>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.subtitle}>Your next useful hobby session lives here.</Text>
      </View>

      {errorMessage ? <Notice message={errorMessage} /> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today's Practice</Text>
            <Text style={styles.sectionSubtitle}>Start one focused session.</Text>
          </View>
          <IconButton icon={<Plus color={colors.text.inverse} size={18} />} onPress={onAddHobby} />
        </View>

        {todaySessions.length > 0 ? (
          todaySessions.map((session) => {
            const hobbyProfile = profilesById.get(session.hobbyProfileId);
            return (
              <Pressable
                accessibilityRole="button"
                key={session.id}
                onPress={() => void onOpenSession(session)}
                style={({ pressed }) => [styles.sessionCard, pressed ? styles.pressed : undefined]}
              >
                <View style={styles.cardTopRow}>
                  <HobbyIcon hobbyProfile={hobbyProfile} />
                  <View style={styles.cardTitleStack}>
                    <Text style={styles.cardMeta}>
                      {hobbyProfile?.name ?? "Hobby"} · Day {session.dayNumber}
                    </Text>
                    <Text style={styles.cardTitle}>{session.title}</Text>
                  </View>
                </View>
                <View style={styles.pillRow}>
                  <InfoPill
                    icon={<Clock3 color={colors.text.brand} size={15} />}
                    text={`${session.estimatedMinutes} min`}
                  />
                  <InfoPill
                    icon={<BookOpenCheck color={colors.text.brand} size={15} />}
                    text={session.status.replace("_", " ")}
                  />
                </View>
              </Pressable>
            );
          })
        ) : (
          <EmptyPanel
            actionLabel={hobbyProfiles.length === 0 ? "Create first hobby" : "Add another hobby"}
            body={
              hobbyProfiles.length === 0
                ? "Choose your first hobby. You can add more anytime."
                : "No session is waiting right now. Start another journey when you are ready."
            }
            onAction={onAddHobby}
            title={hobbyProfiles.length === 0 ? "No hobbies yet" : "All caught up"}
          />
        )}
      </View>

      {popularHobbies.length > 0 ? (
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Popular hobbies</Text>
            <Text style={styles.sectionSubtitle}>Pick one to start a daily journey.</Text>
          </View>
          <View style={styles.hobbyGrid}>
            {popularHobbies.map((hobby) => (
              <Pressable
                accessibilityRole="button"
                key={hobby.name}
                onPress={() => onSelectPopularHobby(hobby)}
                style={({ pressed }) => [styles.hobbyTile, pressed ? styles.pressed : undefined]}
              >
                <HobbyIcon compact icon={hobby.icon} />
                <Text numberOfLines={2} style={styles.hobbyName}>
                  {hobby.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function JourneySetupScreen({
  canGoBack,
  canSkip,
  errorMessage,
  initialHobby,
  isFirstHobby,
  isGenerating,
  onBack,
  onSkip,
  onSubmit,
}: {
  canGoBack: boolean;
  canSkip: boolean;
  errorMessage: string | null;
  initialHobby: DefaultHobby | null;
  isFirstHobby: boolean;
  isGenerating: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: (input: GenerateJourneyInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    hobby: initialHobby?.name ?? "",
    currentLevel: "",
    goal: "",
    minutesPerDay: "20",
    daysPerWeek: "5",
  });
  const input = useMemo(() => {
    const parsed = GenerateJourneyInputSchema.safeParse({
      hobby: form.hobby,
      currentLevel: form.currentLevel,
      goal: form.goal,
      minutesPerDay: Number(form.minutesPerDay),
      daysPerWeek: Number(form.daysPerWeek),
      learningStyle: "balanced",
    });

    return parsed.success ? parsed.data : null;
  }, [form]);
  const setupTitle =
    initialHobby?.name ?? (isFirstHobby ? "Choose your first hobby" : "Add another hobby");
  const setupSubtitle = isFirstHobby
    ? "Choose your first hobby. You can add more anytime."
    : "Create a daily journey without losing your existing hobbies.";
  const submitLabel = isGenerating
    ? "Creating journey..."
    : isFirstHobby
      ? "Create first journey"
      : "Create journey";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      style={styles.keyboardShell}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.container}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />
        {canGoBack ? <BackButton onPress={onBack} /> : null}
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>{isFirstHobby ? "First hobby" : "New journey"}</Text>
          <Text style={styles.title}>{initialHobby ? `Set up ${setupTitle}` : setupTitle}</Text>
          <Text style={styles.subtitle}>{setupSubtitle}</Text>
        </View>
        {errorMessage ? <Notice message={errorMessage} /> : null}
        <View style={styles.form}>
          <Field
            label="Hobby"
            onChangeText={(hobby) => setForm((current) => ({ ...current, hobby }))}
            placeholder="Guitar, chess, cooking..."
            value={form.hobby}
          />
          <Field
            label="Current level"
            multiline
            onChangeText={(currentLevel) => setForm((current) => ({ ...current, currentLevel }))}
            placeholder="I know a few basics but I get stuck..."
            value={form.currentLevel}
          />
          <Field
            label="Goal"
            multiline
            onChangeText={(goal) => setForm((current) => ({ ...current, goal }))}
            placeholder="I want to play one full song smoothly..."
            value={form.goal}
          />
          <View style={styles.formRow}>
            <Field
              keyboardType="numeric"
              label="Minutes/day"
              onChangeText={(minutesPerDay) =>
                setForm((current) => ({
                  ...current,
                  minutesPerDay: minutesPerDay.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="20"
              value={form.minutesPerDay}
            />
            <Field
              keyboardType="numeric"
              label="Days/week"
              onChangeText={(daysPerWeek) =>
                setForm((current) => ({
                  ...current,
                  daysPerWeek: daysPerWeek.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="5"
              value={form.daysPerWeek}
            />
          </View>
        </View>
        <PrimaryButton
          disabled={!input || isGenerating}
          label={submitLabel}
          loading={isGenerating}
          onPress={() => {
            if (input) void onSubmit(input);
          }}
        />
        {canSkip ? (
          <Pressable
            accessibilityRole="button"
            disabled={isGenerating}
            onPress={onSkip}
            style={({ pressed }) => [
              styles.skipButton,
              isGenerating ? styles.skipButtonDisabled : undefined,
              pressed && !isGenerating ? styles.pressed : undefined,
            ]}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SessionDetailScreen({
  onBack,
  onComplete,
  session,
}: {
  onBack: () => void;
  onComplete: (notes: string) => Promise<void>;
  session: DailySession;
}) {
  const [notes, setNotes] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      style={styles.keyboardShell}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.container}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />
        <BackButton onPress={onBack} />
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>Day {session.dayNumber}</Text>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.subtitle}>{session.estimatedMinutes} minute session</Text>
        </View>
        <SessionSection title="Learn" body={session.learn} />
        {session.resource ? <ResourceSection resource={session.resource} /> : null}
        <SessionSection title="Practice" body={session.practice} />
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>Check Yourself</Text>
          <Text style={styles.detailBody}>{session.checkYourself.prompt}</Text>
          {session.checkYourself.items.map((item) => (
            <Text key={item} style={styles.checkItem}>
              - {item}
            </Text>
          ))}
        </View>
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>Reflect</Text>
          <Text style={styles.detailBody}>{session.reflectionPrompt}</Text>
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="Write one honest note..."
            placeholderTextColor={colors.text.placeholder}
            style={[styles.input, styles.textArea]}
            value={notes}
          />
        </View>
        <PrimaryButton
          disabled={notes.trim().length === 0}
          label="Complete session"
          onPress={() => void onComplete(notes.trim())}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ReviewScreen({
  cards,
  onBack,
  onReviewCard,
}: {
  cards: PracticeCard[];
  onBack: () => void;
  onReviewCard: (
    cardId: string,
    difficulty: Exclude<CardDifficulty, "new">,
    wasCorrect: boolean,
  ) => Promise<void>;
}) {
  const [reviewQueue] = useState(cards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const activeCard = reviewQueue[activeIndex] ?? null;

  async function submitReview(difficulty: Exclude<CardDifficulty, "new">) {
    if (!activeCard) {
      return;
    }

    await tapFeedback();
    await onReviewCard(activeCard.id, difficulty, difficulty !== "hard");
    setCompletedCount((count) => count + 1);
    setIsRevealed(false);
    setActiveIndex((index) => index + 1);
  }

  if (!activeCard) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />
        <BackButton onPress={onBack} />
        <EmptyPanel
          actionLabel="Back to Today"
          body={
            completedCount > 0
              ? `You cleared ${completedCount} review cards.`
              : "Complete sessions to create useful cards."
          }
          onAction={onBack}
          title={completedCount > 0 ? "Review complete" : "No cards due"}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>Review</Text>
        <Text style={styles.title}>
          Card {Math.min(activeIndex + 1, reviewQueue.length)} of {reviewQueue.length}
        </Text>
        <Text style={styles.subtitle}>Tap the card to reveal the answer.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsRevealed((revealed) => !revealed)}
        style={({ pressed }) => [styles.reviewCard, pressed ? styles.pressed : undefined]}
      >
        <Text style={styles.cardMeta}>{activeCard.type}</Text>
        <Text style={styles.reviewPrompt}>{isRevealed ? activeCard.back : activeCard.front}</Text>
        {activeCard.prompt || activeCard.answer ? (
          <Text style={styles.reviewSupport}>
            {isRevealed ? (activeCard.answer ?? activeCard.back) : activeCard.prompt}
          </Text>
        ) : null}
        <Text style={styles.reviewHint}>{isRevealed ? "How did it feel?" : "Tap to reveal"}</Text>
      </Pressable>

      <View style={styles.reviewActions}>
        <ReviewActionButton
          disabled={!isRevealed}
          label="Hard"
          onPress={() => void submitReview("hard")}
          tone="hard"
        />
        <ReviewActionButton
          disabled={!isRevealed}
          label="Okay"
          onPress={() => void submitReview("okay")}
          tone="okay"
        />
        <ReviewActionButton
          disabled={!isRevealed}
          label="Easy"
          onPress={() => void submitReview("easy")}
          tone="easy"
        />
      </View>
    </ScrollView>
  );
}

function ReviewActionButton({
  disabled,
  label,
  onPress,
  tone,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  tone: "hard" | "okay" | "easy";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.reviewAction,
        getReviewActionToneStyle(tone),
        disabled ? styles.reviewActionDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      <Text style={styles.reviewActionText}>{label}</Text>
    </Pressable>
  );
}

function getReviewActionToneStyle(tone: "hard" | "okay" | "easy") {
  if (tone === "hard") return styles.reviewActionHard;
  if (tone === "okay") return styles.reviewActionOkay;
  return styles.reviewActionEasy;
}

function ResourceSection({ resource }: { resource: SessionResource }) {
  const description = resource.description?.trim();

  if (!description && !resource.url) {
    return null;
  }

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{resource.title}</Text>
      {description ? <Text style={styles.detailBody}>{description}</Text> : null}
      {resource.url ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(resource.url as string)}
          style={({ pressed }) => [styles.resourceLink, pressed ? styles.pressed : undefined]}
        >
          <Text style={styles.resourceLinkText}>
            {resource.type === "video" ? "Open video" : "Open resource"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SessionSection({ body, title }: { body: string; title: string }) {
  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailBody}>{body}</Text>
    </View>
  );
}

function Field({
  keyboardType = "default",
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "numeric";
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        style={[styles.input, multiline ? styles.textArea : undefined]}
        value={value}
      />
    </View>
  );
}

function HobbyIcon({
  compact = false,
  hobbyProfile,
  icon,
}: {
  compact?: boolean;
  hobbyProfile?: HobbyProfile;
  icon?: DefaultHobby["icon"];
}) {
  const Icon = hobbyIcons[icon ?? hobbyProfile?.icon ?? "sparkles"];

  return (
    <View style={[styles.iconBadge, compact ? styles.iconBadgeCompact : undefined]}>
      <Icon color={colors.action.primary} size={compact ? 18 : 22} strokeWidth={2.5} />
    </View>
  );
}

function normalizeHobbyName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress} style={styles.backButton}>
      <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
      <Text style={styles.backButtonText}>Back</Text>
    </Pressable>
  );
}

function PrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled ? styles.primaryButtonDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} size={18} />
      ) : (
        <Check color={colors.text.inverse} size={18} strokeWidth={2.8} />
      )}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function IconButton({ icon, onPress }: { icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.iconButton}>
      {icon}
    </Pressable>
  );
}

function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View style={styles.infoPill}>
      {icon}
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

function Notice({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

function EmptyPanel({
  actionLabel,
  body,
  onAction,
  title,
}: {
  actionLabel: string;
  body: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <Pressable accessibilityRole="button" onPress={onAction} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

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
  cardMeta: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "800",
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  cardTitleStack: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  checkItem: {
    ...typography.bodyMedium,
    color: colors.text.body,
  },
  container: {
    backgroundColor: colors.surface.card,
    flexGrow: 1,
    gap: spacing.panel,
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  detailBody: {
    ...typography.bodyLarge,
    color: colors.text.body,
  },
  detailPanel: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.panel,
  },
  detailTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  emptyBody: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  emptyPanel: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.panel,
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  eyebrow: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "800",
  },
  field: {
    flex: 1,
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  form: {
    gap: spacing.lg,
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  headerBlock: {
    gap: spacing.md,
  },
  heroIcon: {
    position: "absolute",
    right: 22,
    top: 24,
  },
  heroPanel: {
    backgroundColor: colors.surface.successSoft,
    borderRadius: 32,
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.panel + 2,
    position: "relative",
  },
  hobbyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  hobbyName: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
  },
  hobbyTile: {
    alignItems: "center",
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: "30.6%",
    flexGrow: 0,
    flexShrink: 0,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  iconBadgeCompact: {
    height: 38,
    width: 38,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  infoPill: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoPillText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  input: {
    ...typography.bodyLarge,
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text.primary,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  keyboardShell: {
    backgroundColor: colors.surface.card,
    flex: 1,
  },
  notice: {
    backgroundColor: colors.feedback.dangerBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noticeText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },
  reviewAction: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  reviewActionDisabled: {
    opacity: 0.42,
  },
  reviewActionEasy: {
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderWidth: 1,
  },
  reviewActionHard: {
    backgroundColor: colors.feedback.dangerBackground,
    borderColor: colors.borders.danger,
    borderWidth: 1,
  },
  reviewActionOkay: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderWidth: 1,
  },
  reviewActionText: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  reviewActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.xl,
    justifyContent: "center",
    minHeight: 300,
    padding: spacing.panel + 4,
  },
  reviewHint: {
    ...typography.labelLarge,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  reviewPrompt: {
    ...typography.titleLarge,
    color: colors.text.primary,
    textAlign: "center",
  },
  reviewSupport: {
    ...typography.bodyLarge,
    color: colors.text.body,
    textAlign: "center",
  },
  resourceLink: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resourceLinkText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    ...typography.labelLarge,
    color: colors.text.inverse,
  },
  section: {
    gap: spacing.lg,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 21,
  },
  sessionCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.panel,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  skipButtonDisabled: {
    opacity: 0.42,
  },
  skipButtonText: {
    ...typography.labelLarge,
    color: colors.text.muted,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  title: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
});
