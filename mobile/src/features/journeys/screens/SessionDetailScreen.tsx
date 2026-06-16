import type { DailySession } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";

import { colors } from "../../../theme/colors";
import {
  BackButton,
  PrimaryButton,
  ResourceSection,
  SessionSection,
} from "../components/JourneyUi";
import { styles } from "./styles";

export function SessionDetailScreen({
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
