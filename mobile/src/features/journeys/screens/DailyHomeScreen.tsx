import type { DailySession } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, Platform, ScrollView } from "react-native";

import { getUserProfile, saveUserProfile, type UserProfile } from "../../../db";
import { colors } from "../../../theme/colors";
import { successFeedback, tapFeedback } from "../../../utils/haptics";
import { OnboardingScreen } from "../../onboarding/screens/OnboardingScreen";
import type { DefaultHobby } from "../defaultHobbies";
import { useDailyJourneys } from "../useDailyJourneys";
import { JourneySetupScreen } from "./JourneySetupScreen";
import { MyHobbiesScreen } from "./MyHobbiesScreen";
import { ReviewScreen } from "./ReviewScreen";
import { SessionDetailScreen } from "./SessionDetailScreen";
import { styles } from "./styles";
import { TodayScreen } from "./TodayScreen";

type ScreenMode = "today" | "setup" | "session" | "review" | "hobbies";

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
    if (Platform.OS === "web" || typeof BackHandler.addEventListener !== "function") {
      return;
    }

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

  if (mode === "hobbies") {
    return (
      <MyHobbiesScreen
        hobbyProfiles={hobbyProfiles}
        onAddHobby={() => {
          setSetupHobby(null);
          setMode("setup");
        }}
        onBack={() => setMode("today")}
        onOpenSession={openSession}
        todaySessions={todaySessions}
      />
    );
  }

  return (
    <TodayScreen
      dueCards={dueCards}
      errorMessage={errorMessage}
      hobbyProfiles={hobbyProfiles}
      onAddHobby={() => {
        setSetupHobby(null);
        setMode("setup");
      }}
      onOpenHobbies={() => setMode("hobbies")}
      onOpenReview={() => setMode("review")}
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
