import { TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
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
      activeOutlineColor={colors.sage}
      keyboardType={keyboardType}
      mode="outlined"
      multiline={multiline}
      onChangeText={onChangeText}
      outlineColor="#d8c8af"
      outlineStyle={onboardingStyles.inputOutline}
      placeholder={placeholder}
      placeholderTextColor="#9a8d7c"
      style={[onboardingStyles.input, multiline && onboardingStyles.multilineInput]}
      textColor={colors.ink}
      value={value}
    />
  );
}
