import { Text, View } from "react-native";
import { onboardingStyles } from "../styles";
import { ONBOARDING_STEP_COUNT } from "../useOnboardingForm";

interface StepHeaderProps {
  hint: string;
  step: number;
  title: string;
}

export function StepHeader({ hint, step, title }: StepHeaderProps) {
  const progressPercent = ((step + 1) / ONBOARDING_STEP_COUNT) * 100;

  return (
    <View style={onboardingStyles.stepHeader}>
      <Text style={onboardingStyles.stepMeta}>
        Step {step + 1} of {ONBOARDING_STEP_COUNT}
      </Text>
      <View style={onboardingStyles.progressTrack}>
        <View style={[onboardingStyles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={onboardingStyles.stepTitle}>{title}</Text>
      <Text style={onboardingStyles.stepHint}>{hint}</Text>
    </View>
  );
}
