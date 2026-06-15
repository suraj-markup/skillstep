import { StatusBar } from "expo-status-bar";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { OnboardingTextInput } from "../components/OnboardingTextInput";
import { useOnboardingForm } from "../useOnboardingForm";

const hobbiesIllustration =
  require("../../../../assets/onboarding-hobbies.png") as ImageSourcePropType;

interface OnboardingScreenProps {
  onComplete: (name: string) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { canContinue, name, setName } = useOnboardingForm();
  const [step, setStep] = useState<"welcome" | "discover" | "name">("welcome");

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.shell}>
        {step === "welcome" ? (
          <WelcomeStep onGetStarted={() => setStep("discover")} />
        ) : step === "discover" ? (
          <DiscoverStep onBack={() => setStep("welcome")} onNext={() => setStep("name")} />
        ) : (
          <NameStep
            canContinue={canContinue}
            name={name}
            onBack={() => setStep("discover")}
            onChangeName={setName}
            onComplete={() => onComplete(name)}
          />
        )}
      </ScrollView>
    </View>
  );
}

function WelcomeStep({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <View style={styles.heroStage}>
        <View style={[styles.mintPanel, styles.heroMintPanel]} />
        <Sparkles
          color={colors.surface.card}
          size={74}
          strokeWidth={1.7}
          style={styles.heroLightSparkle}
        />
        <Sparkles
          color={colors.surface.inverse}
          size={52}
          strokeWidth={1.9}
          style={styles.heroDarkSparkle}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>It's easy to achieve your goals</Text>
          <Text style={styles.heroSubtitle}>with Skillstep</Text>
        </View>
      </View>

      <PageDots activeIndex={0} />

      <View style={styles.bottomStage}>
        <View style={[styles.mintPanel, styles.bottomMintPanel]} />
        <PrimaryAction label="Get Started" onPress={onGetStarted} />
      </View>
    </>
  );
}

function DiscoverStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <>
      <View style={styles.discoverStage}>
        <View style={[styles.mintPanel, styles.discoverMintPanel]} />
        <Sparkles
          color={colors.surface.card}
          size={58}
          strokeWidth={1.7}
          style={styles.discoverLightSparkle}
        />
        <View style={styles.illustrationFrame}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={hobbiesIllustration}
            style={styles.hobbiesIllustration}
          />
        </View>
        <View style={styles.discoverCopy}>
          <Text style={styles.stepMeta}>Find your thing</Text>
          <Text style={styles.discoverTitle}>Pick a hobby that fits your life</Text>
          <Text style={styles.discoverHint}>
            Start from popular ideas or search anything you want to practice. Skillstep turns it
            into small daily steps you can actually keep.
          </Text>
        </View>
      </View>

      <PageDots activeIndex={1} />

      <View style={styles.bottomStage}>
        <View style={[styles.mintPanel, styles.bottomMintPanel]} />
        <PrimaryAction label="Next" onPress={onNext} />
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backLink}>
          <Text style={styles.secondaryActionText}>Back</Text>
        </Pressable>
      </View>
    </>
  );
}

interface NameStepProps {
  canContinue: boolean;
  name: string;
  onBack: () => void;
  onChangeName: (value: string) => void;
  onComplete: () => Promise<void>;
}

function NameStep({ canContinue, name, onBack, onChangeName, onComplete }: NameStepProps) {
  return (
    <>
      <View style={styles.nameStage}>
        <View style={[styles.mintPanel, styles.nameMintPanel]} />
        <Sparkles
          color={colors.surface.card}
          size={58}
          strokeWidth={1.7}
          style={styles.nameLightSparkle}
        />
        <View style={styles.nameCopy}>
          <Text style={styles.stepMeta}>First, a name</Text>
          <Text style={styles.nameTitle}>What should we call you?</Text>
          <Text style={styles.nameHint}>
            We use your name to make the dashboard feel personal. Your plans stay local on this
            device.
          </Text>
        </View>
      </View>

      <PageDots activeIndex={2} />

      <View style={styles.formPanel}>
        <OnboardingTextInput onChangeText={onChangeName} placeholder="Your name" value={name} />
        <PrimaryAction disabled={!canContinue} label="Continue" onPress={onComplete} />
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backLink}>
          <Text style={styles.secondaryActionText}>Back</Text>
        </Pressable>
      </View>
    </>
  );
}

function PageDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.pageDots}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[styles.pageDot, index === activeIndex ? styles.pageDotActive : undefined]}
        />
      ))}
    </View>
  );
}

interface PrimaryActionProps {
  disabled?: boolean;
  label: string;
  onPress: () => void | Promise<void>;
}

function PrimaryAction({ disabled = false, label, onPress }: PrimaryActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryAction,
        disabled ? styles.primaryActionDisabled : undefined,
        pressed && !disabled ? styles.primaryActionPressed : undefined,
      ]}
    >
      <Text style={styles.primaryActionLabel}>{label}</Text>
      <ArrowRight color={colors.text.inverse} size={20} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface.card,
    flex: 1,
  },
  shell: {
    flexGrow: 1,
    justifyContent: "space-between",
    minHeight: "100%",
    overflow: "hidden",
    paddingBottom: spacing.screenBottom,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.onboardingTop + 8,
  },
  heroStage: {
    minHeight: 520,
    position: "relative",
  },
  mintPanel: {
    backgroundColor: colors.surface.successSoft,
    position: "absolute",
  },
  heroMintPanel: {
    borderRadius: 42,
    height: 420,
    left: -58,
    right: -54,
    top: 74,
    transform: [{ rotate: "-8deg" }],
  },
  heroLightSparkle: {
    position: "absolute",
    right: 35,
    top: 104,
  },
  heroDarkSparkle: {
    left: 22,
    position: "absolute",
    top: 376,
  },
  heroCopy: {
    gap: spacing.screen,
    paddingTop: 208,
    position: "relative",
  },
  heroTitle: {
    ...typography.displayLarge,
    color: colors.text.primary,
    fontSize: 40,
    lineHeight: 48,
    maxWidth: 340,
  },
  heroSubtitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
  },
  pageDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xl,
    justifyContent: "center",
    marginBottom: spacing.screen,
  },
  pageDot: {
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    height: 11,
    opacity: 0.85,
    width: 11,
  },
  pageDotActive: {
    width: 36,
  },
  bottomStage: {
    alignItems: "center",
    gap: spacing.xl,
    minHeight: 228,
    paddingTop: 74,
    position: "relative",
  },
  bottomMintPanel: {
    borderRadius: 40,
    bottom: -spacing.screenBottom,
    height: 250,
    left: -54,
    right: -54,
    top: 0,
    transform: [{ rotate: "-7deg" }],
  },
  primaryAction: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "center",
    minHeight: 66,
    paddingHorizontal: spacing.panel,
    position: "relative",
  },
  primaryActionDisabled: {
    opacity: 0.45,
  },
  primaryActionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  primaryActionLabel: {
    ...typography.button,
    color: colors.text.inverse,
    fontSize: 22,
    lineHeight: 26,
  },
  secondaryActionText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 26,
  },
  nameStage: {
    minHeight: 468,
    position: "relative",
  },
  discoverStage: {
    minHeight: 540,
    position: "relative",
  },
  discoverMintPanel: {
    borderRadius: 42,
    height: 444,
    left: -58,
    right: -54,
    top: 70,
    transform: [{ rotate: "7deg" }],
  },
  discoverLightSparkle: {
    position: "absolute",
    right: 32,
    top: 104,
  },
  illustrationFrame: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.success,
    borderRadius: 36,
    borderWidth: 1,
    height: 194,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    right: 12,
    top: 102,
    transform: [{ rotate: "-3deg" }],
  },
  hobbiesIllustration: {
    height: 244,
    width: 244,
  },
  discoverCopy: {
    gap: spacing.xl,
    paddingTop: 328,
    position: "relative",
  },
  discoverTitle: {
    ...typography.displayLarge,
    color: colors.text.primary,
    fontSize: 39,
    lineHeight: 49,
    maxWidth: 330,
  },
  discoverHint: {
    ...typography.bodyLarge,
    color: colors.text.body,
    maxWidth: 334,
  },
  nameMintPanel: {
    borderRadius: 42,
    height: 372,
    left: -52,
    right: -52,
    top: 48,
    transform: [{ rotate: "-7deg" }],
  },
  nameLightSparkle: {
    position: "absolute",
    right: 38,
    top: 84,
  },

  nameCopy: {
    gap: spacing.xl,
    paddingTop: 160,
    position: "relative",
  },
  stepMeta: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  nameTitle: {
    ...typography.displayLarge,
    color: colors.text.primary,
    fontSize: 39,
    lineHeight: 49,
    maxWidth: 330,
  },
  nameHint: {
    ...typography.bodyLarge,
    color: colors.text.body,
    maxWidth: 330,
  },
  formPanel: {
    gap: spacing.panel,
    paddingBottom: spacing.xl,
  },
  backLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
});
