import { StatusBar } from "expo-status-bar";
import { Plus, Sparkles } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  getUserHobbies,
  getUserProfile,
  saveUserHobby,
  saveUserProfile,
  type UserHobby,
  type UserProfile,
} from "../../../db";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { OnboardingScreen } from "../../onboarding/screens/OnboardingScreen";
import { HobbyCard } from "../components/HobbyCard";
import { LoadingPlansRow } from "../components/LoadingPlansRow";
import { StatusNotice } from "../components/StatusNotice";
import { DEFAULT_HOBBIES } from "../defaultHobbies";
import { usePlans } from "../usePlans";
import { AddHobbyScreen } from "./AddHobbyScreen";
import { FindingRecommendationsScreen } from "./FindingRecommendationsScreen";
import { PlanDetailScreen } from "./PlanDetailScreen";
import { PlanSetupScreen } from "./PlanSetupScreen";

type ScreenMode = "add" | "dashboard" | "detail" | "finding" | "setup";

export function PlansHomeScreen() {
  const {
    errorMessage,
    generatePlan,
    isGenerating,
    isLoading,
    plans,
    progress,
    progressByPlanId,
    selectedPlan,
    selectedPlanStates,
    selectPlan,
    setTechniqueStatus,
    toggleCriterion,
  } = usePlans();
  const { width: screenWidth } = useWindowDimensions();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [mode, setMode] = useState<ScreenMode>("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [pendingSearchHobby, setPendingSearchHobby] = useState<string | null>(null);
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
  const [userHobbies, setUserHobbies] = useState<UserHobby[]>([]);

  const goBackToDashboard = useCallback(() => {
    setDetailPlanId(null);
    setPendingSearchHobby(null);
    setSelectedHobby(null);
    setMode("dashboard");
  }, []);

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

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (mode === "dashboard") {
        return false;
      }

      goBackToDashboard();
      return true;
    });

    return () => subscription.remove();
  }, [goBackToDashboard, mode]);

  async function completeOnboarding(name: string) {
    const savedProfile = await saveUserProfile(name);
    setProfile(savedProfile);
  }

  const loadUserHobbies = useCallback(async () => {
    const savedHobbies = await getUserHobbies();
    setUserHobbies(savedHobbies);
  }, []);

  const openPlanSetup = useCallback(
    async (hobby: string, options: { icon?: UserHobby["icon"]; source: UserHobby["source"] }) => {
      const trimmedHobby = hobby.trim();

      if (!trimmedHobby) {
        return;
      }

      const savedHobby = await saveUserHobby({
        icon: options.icon,
        name: trimmedHobby,
        source: options.source,
      });
      await loadUserHobbies();
      setSelectedHobby(savedHobby.name);
      setMode("setup");
    },
    [loadUserHobbies],
  );

  function startCustomHobbySearch(hobby: string) {
    const trimmedHobby = hobby.trim();

    if (!trimmedHobby) {
      return;
    }

    setPendingSearchHobby(trimmedHobby);
    setMode("finding");
  }

  async function submitPlan(input: Parameters<typeof generatePlan>[0]) {
    const didGenerate = await generatePlan(input);

    if (didGenerate) {
      setDetailPlanId(null);
      setMode("detail");
      setSearchValue("");
      await loadUserHobbies();
    }
  }

  useEffect(() => {
    if (profile) {
      loadUserHobbies();
    }
  }, [profile, loadUserHobbies]);

  useEffect(() => {
    if (mode !== "finding" || !pendingSearchHobby) {
      return;
    }

    const timeout = setTimeout(() => {
      openPlanSetup(pendingSearchHobby, { source: "search" });
    }, 900);

    return () => clearTimeout(timeout);
  }, [mode, openPlanSetup, pendingSearchHobby]);

  const hobbyRailCardWidth = useMemo(() => {
    const availableWidth = screenWidth - spacing.screen * 2 - spacing.lg * 2;
    return Math.max(96, Math.min(118, availableWidth / 3));
  }, [screenWidth]);
  const planByHobbyName = useMemo(() => {
    const plansByName = new Map<string, (typeof plans)[number]>();

    for (const plan of plans) {
      const hobbyKey = normalizeHobbyKey(plan.hobby);
      if (!plansByName.has(hobbyKey)) {
        plansByName.set(hobbyKey, plan);
      }
    }

    return plansByName;
  }, [plans]);
  const dashboardHobbies = useMemo(() => {
    const hobbiesByName = new Map<string, UserHobby>();

    for (const hobby of userHobbies) {
      hobbiesByName.set(normalizeHobbyKey(hobby.name), hobby);
    }

    for (const plan of plans) {
      const hobbyKey = normalizeHobbyKey(plan.hobby);
      if (!hobbiesByName.has(hobbyKey)) {
        hobbiesByName.set(hobbyKey, {
          icon: plan.icon,
          id: hobbyKey,
          name: plan.hobby,
          source: "search",
        });
      }
    }

    return Array.from(hobbiesByName.values());
  }, [plans, userHobbies]);
  const dashboardHobbyNames = useMemo(
    () => new Set(dashboardHobbies.map((hobby) => normalizeHobbyKey(hobby.name))),
    [dashboardHobbies],
  );
  const availableDefaultHobbies = useMemo(
    () =>
      DEFAULT_HOBBIES.filter((hobby) => !dashboardHobbyNames.has(normalizeHobbyKey(hobby.name))),
    [dashboardHobbyNames],
  );
  const detailPlan = useMemo(
    () => plans.find((plan) => plan.id === detailPlanId) ?? selectedPlan,
    [detailPlanId, plans, selectedPlan],
  );
  const detailPlanProgress = detailPlan ? (progressByPlanId[detailPlan.id] ?? progress) : null;

  function openHobbyCard(
    hobby: string,
    options: { icon?: UserHobby["icon"]; source: UserHobby["source"] },
  ) {
    const existingPlan = planByHobbyName.get(normalizeHobbyKey(hobby));

    if (existingPlan) {
      setDetailPlanId(existingPlan.id);
      selectPlan(existingPlan.id);
      setMode("detail");
      return;
    }

    void openPlanSetup(hobby, options);
  }

  if (isProfileLoading || isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />
        <LoadingPlansRow />
      </ScrollView>
    );
  }

  if (!profile) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (mode === "setup" && selectedHobby) {
    return (
      <PlanSetupScreen
        errorMessage={errorMessage}
        hobby={selectedHobby}
        isGenerating={isGenerating}
        onBack={goBackToDashboard}
        onSubmit={submitPlan}
      />
    );
  }

  if (mode === "add") {
    return (
      <AddHobbyScreen
        defaultHobbies={DEFAULT_HOBBIES}
        onBack={goBackToDashboard}
        onChangeSearch={setSearchValue}
        onSearch={() => startCustomHobbySearch(searchValue)}
        onSelectDefaultHobby={(hobby, icon) => openHobbyCard(hobby, { icon, source: "default" })}
        searchValue={searchValue}
      />
    );
  }

  if (mode === "detail" && detailPlan) {
    return (
      <PlanDetailScreen
        onBack={goBackToDashboard}
        onSetTechniqueStatus={setTechniqueStatus}
        onToggleCriterion={toggleCriterion}
        plan={detailPlan}
        progressPercent={detailPlanProgress?.percent ?? 0}
        states={selectedPlanStates}
      />
    );
  }

  if (mode === "finding" && pendingSearchHobby) {
    return <FindingRecommendationsScreen hobby={pendingSearchHobby} onCancel={goBackToDashboard} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.heroPanel}>
        <Sparkles
          color={colors.surface.card}
          size={58}
          strokeWidth={1.8}
          style={styles.heroSparkle}
        />
        <View style={styles.headerTopRow}>
          <Text style={styles.eyebrow}>Welcome back,</Text>
        </View>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.subtitle}>
          Choose a hobby and Skillstep will shape the next useful practice plan around your level.
        </Text>
      </View>

      {errorMessage ? <StatusNotice message={errorMessage} /> : null}

      {dashboardHobbies.length > 0 ? (
        <View style={styles.hobbySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your hobbies</Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={styles.hobbyRail}
            showsHorizontalScrollIndicator={false}
          >
            {dashboardHobbies.map((hobby) => {
              const hobbyPlan = planByHobbyName.get(normalizeHobbyKey(hobby.name));
              const planProgress =
                hobbyPlan === undefined ? undefined : progressByPlanId[hobbyPlan.id];

              return (
                <HobbyCard
                  cardWidth={hobbyRailCardWidth}
                  completedModules={planProgress?.mastered}
                  description={
                    hobbyPlan
                      ? "Plan ready. Tap to view your practice path."
                      : "Saved hobby. Build a plan whenever you are ready."
                  }
                  icon={hobby.icon}
                  key={hobby.id}
                  name={hobby.name}
                  onPress={() =>
                    openHobbyCard(hobby.name, { icon: hobby.icon, source: hobby.source })
                  }
                  moduleCount={planProgress?.active}
                  progressPercent={planProgress?.percent}
                  variant="rail"
                />
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.hobbySection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleStack}>
            <Text style={styles.sectionTitle}>Popular hobbies</Text>
            <Text style={styles.sectionSubtitle}>Pick one to build your first plan.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode("add")}
            style={({ pressed }) => [styles.addHobbyButton, pressed ? styles.pressed : undefined]}
          >
            <Plus color={colors.text.inverse} size={18} strokeWidth={2.6} />
            <Text style={styles.addHobbyButtonText}>Add</Text>
          </Pressable>
        </View>
        <View style={styles.defaultHobbyGrid}>
          {(availableDefaultHobbies.length > 0 ? availableDefaultHobbies : DEFAULT_HOBBIES).map(
            (hobby) => (
              <HobbyCard
                description={hobby.description}
                icon={hobby.icon}
                key={hobby.name}
                name={hobby.name}
                onPress={() => openHobbyCard(hobby.name, { icon: hobby.icon, source: "default" })}
              />
            ),
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    flexGrow: 1,
    gap: spacing.panel,
    justifyContent: "flex-start",
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  heroPanel: {
    backgroundColor: colors.surface.successSoft,
    borderRadius: 36,
    gap: spacing.xl,
    overflow: "hidden",
    padding: spacing.panel + 2,
    position: "relative",
  },
  heroSparkle: {
    position: "absolute",
    right: 22,
    top: 24,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addHobbyButton: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.xl,
  },
  addHobbyButtonText: {
    color: colors.text.inverse,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  eyebrow: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    ...typography.displayLarge,
    color: colors.text.primary,
    fontSize: 42,
    lineHeight: 50,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
  },
  hobbySection: {
    gap: spacing.xl,
  },
  defaultHobbyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  hobbyRail: {
    gap: spacing.lg,
    paddingRight: spacing.screen,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 21,
  },
  sectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  sectionTitleStack: {
    flex: 1,
    gap: spacing.xs,
  },
});

function normalizeHobbyKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
