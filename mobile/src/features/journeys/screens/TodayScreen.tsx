import type { DailySession, HobbyProfile, PracticeCard } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { BookOpenCheck, Clock3, ListChecks, Plus, RotateCcw, Sparkles } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { UserProfile } from "../../../db";
import { colors } from "../../../theme/colors";
import {
  EmptyPanel,
  HobbyIcon,
  IconButton,
  InfoPill,
  Notice,
  RecoveryPanel,
} from "../components/JourneyUi";
import { DEFAULT_HOBBIES, type DefaultHobby } from "../defaultHobbies";
import { styles } from "./styles";

const MAX_TODAY_SESSIONS = 3;

export function TodayScreen({
  dueCards,
  errorMessage,
  hobbyProfiles,
  onAddHobby,
  onOpenHobbies,
  onOpenReview,
  onOpenSession,
  onSelectPopularHobby,
  profile,
  todaySessions,
}: {
  dueCards: PracticeCard[];
  errorMessage: string | null;
  hobbyProfiles: HobbyProfile[];
  onAddHobby: () => void;
  onOpenHobbies: () => void;
  onOpenReview: () => void;
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
  const missedSessions = useMemo(
    () => todaySessions.filter((session) => session.status === "missed"),
    [todaySessions],
  );
  const activeHobbyCount = useMemo(
    () => hobbyProfiles.filter((hobbyProfile) => hobbyProfile.status === "active").length,
    [hobbyProfiles],
  );
  const visibleTodaySessions = useMemo(
    () => todaySessions.slice(0, MAX_TODAY_SESSIONS),
    [todaySessions],
  );
  const hiddenSessionCount = todaySessions.length - visibleTodaySessions.length;

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
      {missedSessions.length > 0 ? (
        <RecoveryPanel
          missedCount={missedSessions.length}
          onOpenSession={() => void onOpenSession(missedSessions[0])}
        />
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today's Practice</Text>
            <Text style={styles.sectionSubtitle}>Start one focused session.</Text>
          </View>
          <View style={styles.iconButtonRow}>
            <IconButton
              icon={<ListChecks color={colors.text.inverse} size={18} />}
              onPress={onOpenHobbies}
            />
            <IconButton
              icon={<Plus color={colors.text.inverse} size={18} />}
              onPress={onAddHobby}
            />
          </View>
        </View>

        {todaySessions.length > 0 ? (
          <>
            {visibleTodaySessions.map((session) => {
              const hobbyProfile = profilesById.get(session.hobbyProfileId);
              return (
                <Pressable
                  accessibilityRole="button"
                  key={session.id}
                  onPress={() => void onOpenSession(session)}
                  style={({ pressed }) => [
                    styles.sessionCard,
                    pressed ? styles.pressed : undefined,
                  ]}
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
            })}
            {hiddenSessionCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={onOpenHobbies}
                style={({ pressed }) => [
                  styles.moreSessionsRow,
                  pressed ? styles.pressed : undefined,
                ]}
              >
                <Text style={styles.moreSessionsText}>
                  {hiddenSessionCount} more {hiddenSessionCount === 1 ? "hobby" : "hobbies"} waiting
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <EmptyPanel
            actionLabel={hobbyProfiles.length === 0 ? "Create first hobby" : "Add another hobby"}
            body={getTodayEmptyBody(hobbyProfiles.length, activeHobbyCount)}
            onAction={onAddHobby}
            title={getTodayEmptyTitle(hobbyProfiles.length, activeHobbyCount)}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Review</Text>
            <Text style={styles.sectionSubtitle}>
              {dueCards.length === 0 ? "No cards due right now." : `${dueCards.length} cards due`}
            </Text>
          </View>
          <IconButton
            disabled={dueCards.length === 0}
            icon={<RotateCcw color={colors.text.inverse} size={17} />}
            onPress={onOpenReview}
          />
        </View>
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

function getTodayEmptyTitle(hobbyCount: number, activeHobbyCount: number): string {
  if (hobbyCount === 0) {
    return "No hobbies yet";
  }

  return activeHobbyCount === 0 ? "No active hobbies" : "All caught up";
}

function getTodayEmptyBody(hobbyCount: number, activeHobbyCount: number): string {
  if (hobbyCount === 0) {
    return "Choose your first hobby. You can add more anytime.";
  }

  if (activeHobbyCount === 0) {
    return "Paused hobbies stay out of your daily practice pressure. Add another hobby when you want something active today.";
  }

  return "No session is waiting right now. Start another journey when you are ready.";
}

function normalizeHobbyName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
