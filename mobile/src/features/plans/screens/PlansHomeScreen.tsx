import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import {
  getUserHobbies,
  getUserProfile,
  saveUserHobby,
  saveUserProfile,
  type UserHobby,
  type UserProfile,
} from "../../../db";
import { OnboardingScreen } from "../../onboarding/screens/OnboardingScreen";
import { HobbyCard } from "../components/HobbyCard";
import { HobbySearchBar } from "../components/HobbySearchBar";
import { LoadingPlansRow } from "../components/LoadingPlansRow";
import { PlanCard } from "../components/PlanCard";
import { PlanChip } from "../components/PlanChip";
import { StatusNotice } from "../components/StatusNotice";
import { DEFAULT_HOBBIES } from "../defaultHobbies";
import { styles } from "../styles";
import { usePlans } from "../usePlans";
import { FindingRecommendationsScreen } from "./FindingRecommendationsScreen";
import { PlanSetupScreen } from "./PlanSetupScreen";

type ScreenMode = "dashboard" | "finding" | "setup";

export function PlansHomeScreen() {
  const {
    errorMessage,
    generatePlan,
    isGenerating,
    isLoading,
    plans,
    progress,
    selectedPlan,
    selectPlan,
  } = usePlans();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [mode, setMode] = useState<ScreenMode>("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [pendingSearchHobby, setPendingSearchHobby] = useState<string | null>(null);
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [userHobbies, setUserHobbies] = useState<UserHobby[]>([]);

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
      setMode("dashboard");
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
        onBack={() => setMode("dashboard")}
        onSubmit={submitPlan}
      />
    );
  }

  if (mode === "finding" && pendingSearchHobby) {
    return (
      <FindingRecommendationsScreen
        hobby={pendingSearchHobby}
        onCancel={() => {
          setPendingSearchHobby(null);
          setMode("dashboard");
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Skillstep</Text>
        <Text style={styles.title}>Hi {profile.name}, what are we improving next?</Text>
        <Text style={styles.subtitle}>
          Pick a popular hobby or search for your own. Skillstep will ask for your level only after
          you choose the hobby.
        </Text>
      </View>

      {errorMessage ? <StatusNotice message={errorMessage} /> : null}

      <HobbySearchBar
        onChangeText={setSearchValue}
        onSubmit={() => startCustomHobbySearch(searchValue)}
        value={searchValue}
      />

      {userHobbies.length > 0 ? (
        <View style={styles.hobbySection}>
          <Text style={styles.sectionTitle}>Your hobbies</Text>
          <View style={styles.hobbyGrid}>
            {userHobbies.map((hobby) => (
              <HobbyCard
                description={
                  hobby.source === "search"
                    ? "Saved from your search. Build a plan whenever you are ready."
                    : "Saved from popular starting points."
                }
                icon={hobby.icon}
                key={hobby.id}
                name={hobby.name}
                onPress={() =>
                  openPlanSetup(hobby.name, { icon: hobby.icon, source: hobby.source })
                }
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.hobbySection}>
        <Text style={styles.sectionTitle}>Popular starting points</Text>
        <View style={styles.hobbyGrid}>
          {DEFAULT_HOBBIES.map((hobby) => (
            <HobbyCard
              description={hobby.description}
              icon={hobby.icon}
              key={hobby.name}
              name={hobby.name}
              onPress={() => openPlanSetup(hobby.name, { icon: hobby.icon, source: "default" })}
            />
          ))}
        </View>
      </View>

      {!isLoading && plans.length > 0 ? (
        <View style={styles.savedPlansSection}>
          <Text style={styles.sectionTitle}>Saved plans</Text>
          <View style={styles.planSwitcher}>
            {plans.map((plan) => (
              <PlanChip
                isSelected={selectedPlan?.id === plan.id}
                key={plan.id}
                onPress={() => selectPlan(plan.id)}
                plan={plan}
              />
            ))}
          </View>
        </View>
      ) : null}

      {selectedPlan ? (
        <PlanCard plan={selectedPlan} progressPercent={progress?.percent ?? 0} />
      ) : null}
    </ScrollView>
  );
}
