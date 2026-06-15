import type { GeneratePlanInput } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { usePlanSetupForm } from "../usePlanSetupForm";

interface PlanSetupScreenProps {
  errorMessage: string | null;
  hobby: string;
  isGenerating: boolean;
  onBack: () => void;
  onSubmit: (input: GeneratePlanInput) => Promise<void>;
}

export function PlanSetupScreen({
  errorMessage,
  hobby,
  isGenerating,
  onBack,
  onSubmit,
}: PlanSetupScreenProps) {
  const { canSubmit, form, input, setLevelFrom, setLevelTo, setWeeklyHours } =
    usePlanSetupForm(hobby);

  async function handleSubmit() {
    if (input) {
      await onSubmit(input);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.headerBack}>
        <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
        <Text style={styles.headerBackText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Sparkles
          color={colors.surface.card}
          size={56}
          strokeWidth={1.8}
          style={styles.headerSparkle}
        />
        <Text style={styles.eyebrow}>Plan setup</Text>
        <Text style={styles.title}>{hobby}</Text>
        <Text style={styles.subtitle}>Now tell Skillstep the level jump you want.</Text>
      </View>

      {errorMessage ? <SetupError message={errorMessage} /> : null}

      <View style={styles.setupPanel}>
        <SetupField
          label="Where are you right now?"
          multiline
          onChangeText={setLevelFrom}
          placeholder="I know the basics, but I feel stuck..."
          value={form.levelFrom}
        />
        <SetupField
          label="What level do you want to reach?"
          multiline
          onChangeText={setLevelTo}
          placeholder="I want to complete full songs smoothly..."
          value={form.levelTo}
        />
        <SetupField
          keyboardType="numeric"
          label="Weekly practice hours"
          onChangeText={setWeeklyHours}
          placeholder="4"
          value={form.weeklyHours}
        />
      </View>

      <View style={styles.setupActions}>
        <Pressable
          accessibilityState={{ disabled: !canSubmit || isGenerating }}
          accessibilityRole="button"
          onPress={() => {
            if (!canSubmit || isGenerating) {
              return;
            }

            void handleSubmit();
          }}
          style={({ pressed }) => [
            styles.primaryActionButton,
            !canSubmit || isGenerating ? styles.primaryActionButtonDisabled : undefined,
            pressed && canSubmit && !isGenerating ? styles.primaryActionButtonPressed : undefined,
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.text.inverse} size={18} />
          ) : (
            <Sparkles color={colors.text.inverse} size={20} strokeWidth={2.5} />
          )}
          <Text style={styles.primaryActionLabel}>Generate plan</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SetupField({
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
    <View style={styles.setupField}>
      <Text style={styles.setupLabel}>{label}</Text>
      <TextInput
        activeOutlineColor={colors.action.primary}
        keyboardType={keyboardType}
        mode="outlined"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        outlineColor={colors.borders.default}
        outlineStyle={styles.setupInputOutline}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        style={[styles.setupInput, multiline && styles.setupInputMultiline]}
        textColor={colors.text.primary}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    flexGrow: 1,
    gap: 20,
    justifyContent: "flex-start",
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  headerBack: {
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
  headerBackText: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  header: {
    backgroundColor: colors.surface.successSoft,
    borderRadius: 36,
    gap: spacing.xl,
    overflow: "hidden",
    padding: spacing.panel + 2,
    position: "relative",
  },
  headerGlow: {
    backgroundColor: colors.surface.card,
    borderRadius: 80,
    height: 150,
    opacity: 0.44,
    position: "absolute",
    right: -58,
    top: -54,
    transform: [{ rotate: "-12deg" }],
    width: 190,
  },
  headerSparkle: {
    position: "absolute",
    right: 22,
    top: 24,
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
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
  },
  notice: {
    backgroundColor: colors.feedback.dangerBackground,
    borderColor: colors.borders.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xxl,
  },
  noticeTitle: {
    ...typography.labelMedium,
    color: colors.feedback.dangerTitle,
  },
  noticeText: {
    ...typography.bodyMedium,
    color: colors.feedback.dangerText,
    fontSize: typography.labelMedium.fontSize,
  },
  setupPanel: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.xxxl,
    padding: spacing.panel,
  },
  setupField: {
    gap: spacing.md,
  },
  setupLabel: {
    color: colors.text.primary,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "800",
  },
  setupInput: {
    backgroundColor: colors.surface.input,
    fontSize: typography.bodyMedium.fontSize,
    minHeight: sizes.buttonHeight + 4,
  },
  setupInputOutline: {
    borderRadius: radius.lg,
  },
  setupInputMultiline: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  setupActions: {
    gap: spacing.lg,
  },
  primaryActionButton: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "center",
    minHeight: sizes.buttonHeight + 6,
    paddingHorizontal: spacing.panel,
  },
  primaryActionButtonDisabled: {
    opacity: 0.48,
  },
  primaryActionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  primaryActionLabel: {
    ...typography.button,
    color: colors.text.inverse,
  },
});

function SetupError({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Could not generate the plan</Text>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}
