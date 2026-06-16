import {
  type DailySession,
  type GenerateJourneyInput,
  GenerateJourneyInputSchema,
  type HobbyProfile,
  type PracticeCard,
} from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Clock3,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react-native";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { hobbyIcons } from "../hobbyIcons";
import { useDailyJourneys } from "../useDailyJourneys";

type ScreenMode = "today" | "setup" | "session" | "review";

export function DailyHomeScreen() {
  const {
    dueCards,
    errorMessage,
    generateJourney,
    hobbyProfiles,
    isGenerating,
    isLoading,
    saveReflection,
    todaySessions,
    updateSessionStatus,
  } = useDailyJourneys();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [mode, setMode] = useState<ScreenMode>("today");
  const [activeSession, setActiveSession] = useState<DailySession | null>(null);

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

  if (mode === "setup") {
    return (
      <JourneySetupScreen
        errorMessage={errorMessage}
        isGenerating={isGenerating}
        onBack={() => setMode("today")}
        onSubmit={async (input) => {
          const didGenerate = await generateJourney(input);
          if (didGenerate) setMode("today");
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
    return <ReviewScreen cards={dueCards} onBack={() => setMode("today")} />;
  }

  return (
    <TodayScreen
      dueCards={dueCards}
      errorMessage={errorMessage}
      hobbyProfiles={hobbyProfiles}
      onAddHobby={() => setMode("setup")}
      onOpenReview={() => setMode("review")}
      onOpenSession={openSession}
      profile={profile}
      todaySessions={todaySessions}
    />
  );
}

function TodayScreen({
  dueCards,
  errorMessage,
  hobbyProfiles,
  onAddHobby,
  onOpenReview,
  onOpenSession,
  profile,
  todaySessions,
}: {
  dueCards: PracticeCard[];
  errorMessage: string | null;
  hobbyProfiles: HobbyProfile[];
  onAddHobby: () => void;
  onOpenReview: () => void;
  onOpenSession: (session: DailySession) => Promise<void>;
  profile: UserProfile;
  todaySessions: DailySession[];
}) {
  const profilesById = useMemo(
    () => new Map(hobbyProfiles.map((hobbyProfile) => [hobbyProfile.id, hobbyProfile])),
    [hobbyProfiles],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.heroPanel}>
        <Sparkles color={colors.surface.card} size={54} strokeWidth={1.8} style={styles.heroIcon} />
        <Text style={styles.eyebrow}>Today</Text>
        <Text style={styles.title}>Welcome, {profile.name}</Text>
        <Text style={styles.subtitle}>Your next useful hobby session lives here.</Text>
      </View>

      {errorMessage ? <Notice message={errorMessage} /> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Practice</Text>
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Review</Text>
            <Text style={styles.sectionSubtitle}>{dueCards.length} cards due</Text>
          </View>
          <IconButton
            icon={<RotateCcw color={colors.text.inverse} size={17} />}
            onPress={onOpenReview}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Hobbies</Text>
        <View style={styles.hobbyGrid}>
          {hobbyProfiles.map((hobbyProfile) => (
            <View key={hobbyProfile.id} style={styles.hobbyTile}>
              <HobbyIcon hobbyProfile={hobbyProfile} />
              <Text style={styles.hobbyName}>{hobbyProfile.name}</Text>
              <Text style={styles.hobbyGoal} numberOfLines={2}>
                {hobbyProfile.goal}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function JourneySetupScreen({
  errorMessage,
  isGenerating,
  onBack,
  onSubmit,
}: {
  errorMessage: string | null;
  isGenerating: boolean;
  onBack: () => void;
  onSubmit: (input: GenerateJourneyInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    hobby: "",
    currentLevel: "",
    goal: "",
    minutesPerDay: "20",
    daysPerWeek: "5",
    learningStyle: "balanced",
  });
  const input = useMemo(() => {
    const parsed = GenerateJourneyInputSchema.safeParse({
      hobby: form.hobby,
      currentLevel: form.currentLevel,
      goal: form.goal,
      minutesPerDay: Number(form.minutesPerDay),
      daysPerWeek: Number(form.daysPerWeek),
      learningStyle: form.learningStyle,
    });

    return parsed.success ? parsed.data : null;
  }, [form]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>New journey</Text>
        <Text style={styles.title}>Choose your first hobby</Text>
        <Text style={styles.subtitle}>You can add more hobbies anytime.</Text>
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
        label={isGenerating ? "Creating journey..." : "Create journey"}
        loading={isGenerating}
        onPress={() => {
          if (input) void onSubmit(input);
        }}
      />
    </ScrollView>
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
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>Day {session.dayNumber}</Text>
        <Text style={styles.title}>{session.title}</Text>
        <Text style={styles.subtitle}>{session.estimatedMinutes} minute session</Text>
      </View>
      <SessionSection title="Learn" body={session.learn} />
      {session.resource ? (
        <SessionSection
          title={session.resource.title}
          body={session.resource.description ?? session.resource.type}
        />
      ) : null}
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
  );
}

function ReviewScreen({ cards, onBack }: { cards: PracticeCard[]; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>Review</Text>
        <Text style={styles.title}>{cards.length} cards due</Text>
        <Text style={styles.subtitle}>
          Practice cards will become interactive in the next slice.
        </Text>
      </View>
      {cards.length > 0 ? (
        cards.map((card) => (
          <View key={card.id} style={styles.detailPanel}>
            <Text style={styles.cardMeta}>{card.type}</Text>
            <Text style={styles.detailTitle}>{card.front}</Text>
            <Text style={styles.detailBody}>{card.back}</Text>
          </View>
        ))
      ) : (
        <EmptyPanel
          actionLabel="Back to Today"
          body="Complete sessions to create useful cards."
          onAction={onBack}
          title="No cards due"
        />
      )}
    </ScrollView>
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

function HobbyIcon({ hobbyProfile }: { hobbyProfile?: HobbyProfile }) {
  const Icon = hobbyIcons[hobbyProfile?.icon ?? "sparkles"];

  return (
    <View style={styles.iconBadge}>
      <Icon color={colors.action.primary} size={22} strokeWidth={2.5} />
    </View>
  );
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
  hobbyGoal: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: "center",
  },
  hobbyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  hobbyName: {
    ...typography.labelLarge,
    color: colors.text.primary,
    textAlign: "center",
  },
  hobbyTile: {
    alignItems: "center",
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: spacing.md,
    minHeight: 132,
    padding: spacing.lg,
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
