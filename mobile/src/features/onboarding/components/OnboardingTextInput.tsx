import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { typography } from "../../../theme/typography";

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
      activeOutlineColor={colors.action.primary}
      keyboardType={keyboardType}
      mode="outlined"
      multiline={multiline}
      onChangeText={onChangeText}
      outlineColor={colors.borders.default}
      outlineStyle={styles.inputOutline}
      placeholder={placeholder}
      placeholderTextColor={colors.text.placeholder}
      style={[styles.input, multiline && styles.multilineInput]}
      textColor={colors.text.primary}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.bodyLarge,
    backgroundColor: colors.surface.input,
    color: colors.text.primary,
    minHeight: 56,
  },
  inputOutline: {
    borderRadius: radius.md,
  },
  multilineInput: {
    minHeight: 116,
    textAlignVertical: "top",
  },
});
