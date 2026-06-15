import { UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { OnboardingTextInput } from "../components/OnboardingTextInput";
import { useOnboardingForm } from "../useOnboardingForm";

interface OnboardingScreenProps {
  onComplete: (name: string) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { canContinue, name, setName } = useOnboardingForm();

  return (
    <ScrollView contentContainerStyle={styles.shell}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>Skillstep</Text>
        <Text style={styles.title}>Let’s set up your practice home.</Text>
        <Text style={styles.subtitle}>
          Skillstep helps you pick a hobby, describe the next level, and turn it into a small
          practice plan you can finish.
        </Text>
      </View>

      <View style={styles.stepPanel}>
        <View style={styles.iconCircle}>
          <UserRound color={colors.action.primary} size={26} strokeWidth={2.4} />
        </View>
        <Text style={styles.stepMeta}>First, a name</Text>
        <Text style={styles.stepTitle}>What should we call you?</Text>
        <Text style={styles.stepHint}>
          We use this to make the dashboard feel like yours. Your data stays local on this device.
        </Text>
        <OnboardingTextInput onChangeText={setName} placeholder="Your name" value={name} />
      </View>

      <View style={styles.intentList}>
        <IntentRow text="Choose from popular hobbies or search for your own." />
        <IntentRow text="Describe your current and target level only after choosing a hobby." />
        <IntentRow text="Your generated plans and progress are saved locally." />
      </View>

      <Button
        disabled={!canContinue}
        labelStyle={styles.primaryButtonLabel}
        mode="contained"
        onPress={() => onComplete(name)}
        style={styles.fullWidthPrimaryButton}
        contentStyle={styles.primaryButtonContent}
      >
        Continue
      </Button>
    </ScrollView>
  );
}

function IntentRow({ text }: { text: string }) {
  return (
    <View style={styles.intentRow}>
      <View style={styles.intentDot} />
      <Text style={styles.intentText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.surface.app,
    flexGrow: 1,
    gap: 22,
    justifyContent: "space-between",
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.onboardingTop,
  },
  intro: {
    gap: spacing.xl,
  },
  eyebrow: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    ...typography.displayMedium,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
  },
  stepPanel: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.panel,
    padding: spacing.panel,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: sizes.iconCircle,
    justifyContent: "center",
    width: sizes.iconCircle,
  },
  stepMeta: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  stepTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
  },
  stepHint: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  fullWidthPrimaryButton: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
  },
  primaryButtonContent: {
    minHeight: sizes.buttonHeight,
  },
  primaryButtonLabel: {
    ...typography.button,
  },
  intentList: {
    gap: spacing.lg,
  },
  intentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  intentDot: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.pill,
    height: sizes.progressHeight,
    width: sizes.progressHeight,
  },
  intentText: {
    color: colors.text.muted,
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 21,
  },
});
