import { TextInput } from "react-native";

import { onboardingStyles } from "../styles";

interface OnboardingTextInputProps {
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function OnboardingTextInput({
  keyboardType = "default",
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: OnboardingTextInputProps) {
  return (
    <TextInput
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9a8d7c"
      style={[onboardingStyles.input, multiline && onboardingStyles.multilineInput]}
      value={value}
    />
  );
}
