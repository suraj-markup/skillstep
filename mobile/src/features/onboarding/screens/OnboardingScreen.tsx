import { StatusBar } from "expo-status-bar";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { tapFeedback } from "../../../utils/haptics";
import { OnboardingTextInput } from "../components/OnboardingTextInput";
import { useOnboardingForm } from "../useOnboardingForm";

const hobbiesIllustration =
  require("../../../../assets/onboarding-hobbies.png") as ImageSourcePropType;
const DOT_SIZE = 11;
const DOT_GAP = 14;
const ACTIVE_DOT_WIDTH = 36;

interface OnboardingScreenProps {
  onComplete: (name: string) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { canContinue, name, setName } = useOnboardingForm();
  const [step, setStep] = useState<"welcome" | "discover" | "name">("welcome");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.shell}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
    </KeyboardAvoidingView>
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
            Choose your first hobby, then add more anytime. Skillstep turns each one into small
            daily steps you can actually keep.
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
  const activeDotIndex = useSharedValue(activeIndex);

  useEffect(() => {
    activeDotIndex.value = withTiming(activeIndex, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeDotIndex, activeIndex]);

  const activeDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeDotIndex.value * (DOT_SIZE + DOT_GAP) }],
  }));

  return (
    <View style={styles.pageDots}>
      <View style={styles.pageDotsTrack}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.pageDot} />
        ))}
        <Animated.View style={[styles.pageDotActive, activeDotStyle]} />
      </View>
    </View>
  );
}

interface PrimaryActionProps {
  disabled?: boolean;
  label: string;
  onPress: () => void | Promise<void>;
}

function PrimaryAction({ disabled = false, label, onPress }: PrimaryActionProps) {
  async function handlePress() {
    await tapFeedback();
    await onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => void handlePress()}
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
    justifyContent: "center",
    marginBottom: spacing.screen,
  },
  pageDotsTrack: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: DOT_SIZE,
    position: "relative",
    width: DOT_SIZE * 3 + DOT_GAP * 2,
  },
  pageDot: {
    backgroundColor: colors.borders.default,
    borderRadius: radius.pill,
    height: DOT_SIZE,
    opacity: 0.8,
    width: DOT_SIZE,
  },
  pageDotActive: {
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
    height: DOT_SIZE,
    left: (DOT_SIZE - ACTIVE_DOT_WIDTH) / 2,
    position: "absolute",
    width: ACTIVE_DOT_WIDTH,
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
    minHeight: 532,
    position: "relative",
  },
  discoverMintPanel: {
    borderRadius: 42,
    height: 488,
    left: -58,
    right: -54,
    top: 44,
    transform: [{ rotate: "7deg" }],
  },
  discoverLightSparkle: {
    position: "absolute",
    right: 32,
    top: 104,
  },
  illustrationFrame: {
    alignItems: "center",
    height: 242,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 70,
  },
  hobbiesIllustration: {
    height: 242,
    width: 306,
  },
  discoverCopy: {
    gap: spacing.sm,
    paddingTop: 324,
    position: "relative",
  },
  discoverTitle: {
    ...typography.displayLarge,
    color: colors.text.primary,
    fontSize: 36,
    lineHeight: 43,
    maxWidth: 330,
  },
  discoverHint: {
    ...typography.bodyMedium,
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
