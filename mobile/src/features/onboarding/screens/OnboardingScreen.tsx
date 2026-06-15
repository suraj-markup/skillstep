import { UserRound } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { OnboardingTextInput } from "../components/OnboardingTextInput";
import { onboardingStyles } from "../styles";
import { useOnboardingForm } from "../useOnboardingForm";

interface OnboardingScreenProps {
  onComplete: (name: string) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { canContinue, name, setName } = useOnboardingForm();

  return (
    <ScrollView contentContainerStyle={onboardingStyles.shell}>
      <View style={onboardingStyles.intro}>
        <Text style={onboardingStyles.eyebrow}>Skillstep</Text>
        <Text style={onboardingStyles.title}>Let’s set up your practice home.</Text>
        <Text style={onboardingStyles.subtitle}>
          Skillstep helps you pick a hobby, describe the next level, and turn it into a small
          practice plan you can finish.
        </Text>
      </View>

      <View style={onboardingStyles.stepPanel}>
        <View style={onboardingStyles.iconCircle}>
          <UserRound color={colors.sage} size={26} strokeWidth={2.4} />
        </View>
        <Text style={onboardingStyles.stepMeta}>First, a name</Text>
        <Text style={onboardingStyles.stepTitle}>What should we call you?</Text>
        <Text style={onboardingStyles.stepHint}>
          We use this to make the dashboard feel like yours. Your data stays local on this device.
        </Text>
        <OnboardingTextInput onChangeText={setName} placeholder="Your name" value={name} />
      </View>

      <View style={onboardingStyles.intentList}>
        <IntentRow text="Choose from popular hobbies or search for your own." />
        <IntentRow text="Describe your current and target level only after choosing a hobby." />
        <IntentRow text="Your generated plans and progress are saved locally." />
      </View>

      <Button
        disabled={!canContinue}
        labelStyle={onboardingStyles.primaryButtonLabel}
        mode="contained"
        onPress={() => onComplete(name)}
        style={onboardingStyles.fullWidthPrimaryButton}
        contentStyle={onboardingStyles.primaryButtonContent}
      >
        Continue
      </Button>
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
