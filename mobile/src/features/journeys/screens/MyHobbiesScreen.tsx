import type { DailySession, HobbyProfile } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BackButton, EmptyPanel, HobbyIcon } from "../components/JourneyUi";
import { styles } from "./styles";

export function MyHobbiesScreen({
  hobbyProfiles,
  onAddHobby,
  onBack,
  onOpenSession,
  todaySessions,
}: {
  hobbyProfiles: HobbyProfile[];
  onAddHobby: () => void;
  onBack: () => void;
  onOpenSession: (session: DailySession) => Promise<void>;
  todaySessions: DailySession[];
}) {
  const sessionsByHobbyId = useMemo(
    () => new Map(todaySessions.map((session) => [session.hobbyProfileId, session])),
    [todaySessions],
  );
  const orderedHobbies = useMemo(
    () =>
      [...hobbyProfiles].sort(
        (firstHobby, secondHobby) =>
          getLastInteractionTime(secondHobby, sessionsByHobbyId.get(secondHobby.id)) -
          getLastInteractionTime(firstHobby, sessionsByHobbyId.get(firstHobby.id)),
      ),
    [hobbyProfiles, sessionsByHobbyId],
  );
  const recentHobbyId = orderedHobbies[0]?.id ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />

      <View style={styles.sectionHeader}>
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>Library</Text>
          <Text style={styles.title}>My Hobbies</Text>
          <Text style={styles.subtitle}>Your hobbies, with the most recent one first.</Text>
        </View>
      </View>

      <View style={styles.section}>
        {orderedHobbies.length > 0 ? (
          orderedHobbies.map((hobbyProfile) => {
            const session = sessionsByHobbyId.get(hobbyProfile.id);
            const isRecent = hobbyProfile.id === recentHobbyId;

            return (
              <Pressable
                accessibilityRole={session ? "button" : "text"}
                disabled={!session}
                key={hobbyProfile.id}
                onPress={() => {
                  if (session) void onOpenSession(session);
                }}
                style={({ pressed }) => [
                  styles.hobbyListItem,
                  pressed && session ? styles.pressed : undefined,
                ]}
              >
                <HobbyIcon hobbyProfile={hobbyProfile} />
                <View style={styles.hobbyListCopy}>
                  <View style={styles.hobbyListTitleRow}>
                    <Text style={styles.hobbyListTitle}>{hobbyProfile.name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {isRecent ? "Recent" : hobbyProfile.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.hobbyListMeta}>
                    {session
                      ? `Day ${session.dayNumber} · ${session.title}`
                      : `Goal · ${hobbyProfile.goal}`}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <EmptyPanel
            actionLabel="Create first hobby"
            body="Choose a hobby and start a daily journey."
            onAction={onAddHobby}
            title="No hobbies yet"
          />
        )}
      </View>
    </ScrollView>
  );
}

function getLastInteractionTime(hobbyProfile: HobbyProfile, session?: DailySession): number {
  return Math.max(
    getTime(session?.startedAt),
    getTime(session?.completedAt),
    getTime(hobbyProfile.updatedAt),
  );
}

function getTime(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
