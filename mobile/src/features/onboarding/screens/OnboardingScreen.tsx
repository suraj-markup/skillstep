import type { GeneratePlanInput } from "@skillstep/shared";
import { Sparkles } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { OnboardingTextInput } from "../components/OnboardingTextInput";
import { StepHeader } from "../components/StepHeader";
import { SuggestionChips } from "../components/SuggestionChips";
import { onboardingStyles } from "../styles";
import { useOnboardingForm } from "../useOnboardingForm";

interface OnboardingScreenProps {
  errorMessage: string | null;
  isGenerating: boolean;
  onSubmit: (input: GeneratePlanInput) => Promise<void>;
}

const stepContent = [
  {
    hint: "Any hobby works. The plan should fit the thing you actually want to practice.",
    multiline: false,
    placeholder: "Guitar, chess, photography, pottery...",
    suggestions: ["guitar", "chess", "photography", "cooking"],
    title: "What do you want to get better at?",
  },
  {
    hint: "Be honest and specific. The better the starting point, the better the bridge.",
    multiline: true,
    placeholder: "I know open chords, but my transitions are slow...",
    suggestions: [
      "I am brand new",
      "I know the basics but feel stuck",
      "I can practice, but I lack structure",
    ],
    title: "Where are you right now?",
  },
  {
    hint: "Describe the next believable level, not a fantasy end state.",
    multiline: true,
    placeholder: "I want to play full songs smoothly with steady rhythm...",
    suggestions: [
      "Finish one complete project",
      "Feel confident around friends",
      "Build a repeatable practice routine",
    ],
    title: "What level are you trying to reach?",
  },
  {
    hint: "This keeps the plan realistic. Skillstep sizes drills around your actual week.",
    keyboardType: "numeric" as const,
    multiline: false,
    placeholder: "4",
    suggestions: ["2", "4", "6", "8"],
    title: "How many hours can you practice each week?",
  },
] as const;

export function OnboardingScreen({ errorMessage, isGenerating, onSubmit }: OnboardingScreenProps) {
  const { canGoBack, canGoForward, currentValue, goBack, goForward, input, setCurrentValue, step } =
    useOnboardingForm();
  const content = stepContent[step];
  const isLastStep = step === stepContent.length - 1;
  const canSubmit = isLastStep && input !== null && canGoForward && !isGenerating;

  async function handlePrimaryPress() {
    if (!isLastStep) {
      goForward();
      return;
    }

    if (input) {
      await onSubmit(input);
    }
  }

  return (
    <ScrollView contentContainerStyle={onboardingStyles.shell}>
      <View style={onboardingStyles.intro}>
        <Text style={onboardingStyles.eyebrow}>Skillstep</Text>
        <Text style={onboardingStyles.title}>Turn a vague goal into the next real level.</Text>
        <Text style={onboardingStyles.subtitle}>
          Describe where you are, where you want to go, and how much time you can give. Skillstep
          builds a small practice plan you can actually finish.
        </Text>
      </View>

      <View style={onboardingStyles.stepPanel}>
        <StepHeader hint={content.hint} step={step} title={content.title} />
        <OnboardingTextInput
          keyboardType={"keyboardType" in content ? content.keyboardType : "default"}
          multiline={content.multiline}
          onChangeText={setCurrentValue}
          placeholder={content.placeholder}
          value={currentValue}
        />
        <SuggestionChips onSelect={setCurrentValue} suggestions={[...content.suggestions]} />
      </View>

      {errorMessage ? (
        <View style={onboardingStyles.errorNotice}>
          <Text style={onboardingStyles.errorTitle}>Could not generate the plan</Text>
          <Text style={onboardingStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={onboardingStyles.intentList}>
        <IntentRow text="Your progress is stored locally on this device." />
        <IntentRow text="The plan is limited to a few techniques so it stays finishable." />
        <IntentRow text="You can strike out techniques that do not fit your style." />
      </View>

      <View style={onboardingStyles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={!canGoBack || isGenerating}
          onPress={goBack}
          style={[
            onboardingStyles.secondaryButton,
            (!canGoBack || isGenerating) && onboardingStyles.secondaryButtonDisabled,
          ]}
        >
          <Text style={onboardingStyles.secondaryButtonText}>Back</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isLastStep ? !canSubmit : !canGoForward}
          onPress={handlePrimaryPress}
          style={[
            onboardingStyles.primaryButton,
            (isLastStep ? !canSubmit : !canGoForward) && onboardingStyles.primaryButtonDisabled,
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              {isLastStep ? <Sparkles color={colors.card} size={18} strokeWidth={2.5} /> : null}
              <Text style={onboardingStyles.primaryButtonText}>
                {isLastStep ? "Generate plan" : "Continue"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function IntentRow({ text }: { text: string }) {
  return (
    <View style={onboardingStyles.intentRow}>
      <View style={onboardingStyles.intentDot} />
      <Text style={onboardingStyles.intentText}>{text}</Text>
    </View>
  );
}
