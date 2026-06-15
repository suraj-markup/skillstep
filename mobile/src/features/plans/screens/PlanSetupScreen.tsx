import type { GeneratePlanInput } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator, TextInput } from "react-native-paper";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { tapFeedback } from "../../../utils/haptics";
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
      await tapFeedback();
      await onSubmit(input);
    }
  }

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
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.headerBack}
        >
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

        {isGenerating ? <GenerationStatusPanel hobby={hobby} /> : null}

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
    </KeyboardAvoidingView>
  );
}

function GenerationStatusPanel({ hobby }: { hobby: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );
  }, [pulse]);

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.28, 0.72]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.14]) }],
  }));
  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.92, 0.46]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1.04, 0.9]) }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(pulse.value, [0, 1], [2, -3]) }],
  }));

  return (
    <Animated.View style={[styles.generationPanel, cardStyle]}>
      <View style={styles.generationIconStage}>
        <Animated.View style={[styles.generationOuterRing, outerRingStyle]} />
        <Animated.View style={[styles.generationInnerRing, innerRingStyle]} />
        <View style={styles.generationIconBadge}>
          <BrainCircuit color={colors.text.inverse} size={26} strokeWidth={2.3} />
        </View>
      </View>

      <View style={styles.generationCopy}>
        <Text style={styles.generationEyebrow}>Building your {hobby} path</Text>
        <Text style={styles.generationTitle}>Choosing the smallest useful level jump.</Text>
      </View>

      <View style={styles.generationSteps}>
        {["Reading your level", "Picking 5-8 techniques", "Sizing practice drills"].map((step) => (
          <View key={step} style={styles.generationStep}>
            <View style={styles.generationStepDot} />
            <Text style={styles.generationStepText}>{step}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
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
        numberOfLines={multiline ? 2 : 1}
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
  keyboardShell: {
    backgroundColor: colors.surface.card,
    flex: 1,
  },
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
    maxHeight: 112,
    minHeight: 72,
    textAlignVertical: "top",
  },
  setupActions: {
    gap: spacing.lg,
  },
  generationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  generationEyebrow: {
    ...typography.overline,
    color: colors.text.accent,
  },
  generationIconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  generationIconStage: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
    position: "relative",
    width: 72,
  },
  generationInnerRing: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: 64,
    opacity: 0.5,
    position: "absolute",
    width: 64,
  },
  generationOuterRing: {
    backgroundColor: colors.surface.successSoft,
    borderRadius: radius.pill,
    height: 72,
    position: "absolute",
    width: 72,
  },
  generationPanel: {
    alignItems: "center",
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.success,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    padding: spacing.panel,
  },
  generationStep: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 34,
    paddingHorizontal: spacing.lg,
  },
  generationStepDot: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },
  generationStepText: {
    color: colors.text.brand,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: "800",
  },
  generationSteps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    width: "100%",
  },
  generationTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 20,
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
