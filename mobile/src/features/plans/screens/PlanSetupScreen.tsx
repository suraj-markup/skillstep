import type { GeneratePlanInput } from "@skillstep/shared";
import { Sparkles } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { styles } from "../styles";
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
        activeOutlineColor={colors.sage}
        keyboardType={keyboardType}
        mode="outlined"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        outlineColor="#d8c8af"
        outlineStyle={styles.setupInputOutline}
        placeholder={placeholder}
        placeholderTextColor="#9a8d7c"
        style={[styles.setupInput, multiline && styles.setupInputMultiline]}
        textColor={colors.ink}
        value={value}
      />
    </View>
  );
}

function SetupError({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Could not generate the plan</Text>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}
