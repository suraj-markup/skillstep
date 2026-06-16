import { type GenerateJourneyInput, GenerateJourneyInputSchema } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { BackButton, Field, Notice, PrimaryButton } from "../components/JourneyUi";
import type { DefaultHobby } from "../defaultHobbies";
import { styles } from "./styles";

export function JourneySetupScreen({
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
