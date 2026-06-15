import { Search } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

interface HobbySearchBarProps {
  canSubmit?: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  value: string;
}

export function HobbySearchBar({
  canSubmit,
  onChangeText,
  onSubmit,
  submitLabel = "Go",
  value,
}: HobbySearchBarProps) {
  const isSubmitEnabled = canSubmit ?? value.trim().length > 0;

  return (
    <View style={styles.searchShell}>
      <TextInput
        activeOutlineColor={colors.action.primary}
        contentStyle={styles.searchInputContent}
        left={
          <TextInput.Icon
            icon={({ size }) => (
              <Search color={colors.text.tertiary} size={size} strokeWidth={2.4} />
            )}
          />
        }
        mode="outlined"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        outlineColor={colors.borders.default}
        outlineStyle={styles.searchInputOutline}
        placeholder="Search any hobby"
        placeholderTextColor={colors.text.placeholder}
        returnKeyType="go"
        style={styles.searchInput}
        textColor={colors.text.primary}
        value={value}
      />
      <Button
        disabled={!isSubmitEnabled}
        labelStyle={styles.searchButtonLabel}
        mode="contained"
        onPress={onSubmit}
        style={[styles.searchButton, !isSubmitEnabled ? styles.searchButtonDisabled : undefined]}
        textColor={colors.text.inverse}
        contentStyle={styles.searchButtonContent}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  searchShell: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface.input,
    flex: 1,
    fontSize: typography.bodyMedium.fontSize,
    height: sizes.buttonHeight,
    minWidth: 0,
  },
  searchInputContent: {
    color: colors.text.primary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    paddingLeft: 0,
  },
  searchInputOutline: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  searchButton: {
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
  },
  searchButtonDisabled: {
    opacity: 0.48,
  },
  searchButtonContent: {
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.xs,
  },
  searchButtonLabel: {
    ...typography.button,
    color: colors.text.inverse,
    marginHorizontal: spacing.md,
  },
});
