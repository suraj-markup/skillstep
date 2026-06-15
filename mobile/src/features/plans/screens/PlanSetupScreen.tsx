import type { GeneratePlanInput } from "@skillstep/shared";
import { Sparkles } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Plan setup</Text>
        <Text style={styles.title}>{hobby}</Text>
        <Text style={styles.subtitle}>
          Now tell Skillstep the level jump you want. The AI needs this context before it can build
          a useful plan.
        </Text>
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
        <Button
          disabled={isGenerating}
          labelStyle={styles.secondaryActionLabel}
          mode="outlined"
          onPress={onBack}
          style={styles.secondaryActionButton}
          contentStyle={styles.actionButtonContent}
        >
          Back
        </Button>

        <Button
          disabled={!canSubmit || isGenerating}
          icon={({ color, size }) => <Sparkles color={color} size={size} strokeWidth={2.5} />}
          labelStyle={styles.primaryActionLabel}
          loading={isGenerating}
          mode="contained"
          onPress={handleSubmit}
          style={styles.primaryActionButton}
          contentStyle={styles.actionButtonContent}
        >
          Generate plan
        </Button>
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
    backgroundColor: colors.surface.app,
    flexGrow: 1,
    gap: 20,
    justifyContent: "flex-start",
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  header: {
    gap: spacing.xl,
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
    borderRadius: radius.md,
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
    minHeight: sizes.buttonHeight,
  },
  setupInputOutline: {
    borderRadius: radius.md,
  },
  setupInputMultiline: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  setupActions: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  secondaryActionButton: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    flex: 1,
  },
  actionButtonContent: {
    minHeight: sizes.buttonHeight,
  },
  secondaryActionLabel: {
    ...typography.button,
  },
  primaryActionButton: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    flex: 1,
  },
  primaryActionLabel: {
    ...typography.button,
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
