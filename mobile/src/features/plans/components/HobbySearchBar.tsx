import { Search } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

interface HobbySearchBarProps {
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  value: string;
}

export function HobbySearchBar({ onChangeText, onSubmit, value }: HobbySearchBarProps) {
  const canSubmit = value.trim().length > 0;

  return (
    <View style={styles.searchShell}>
      <TextInput
        activeOutlineColor={colors.action.primary}
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
        disabled={!canSubmit}
        labelStyle={styles.searchButtonLabel}
        mode="contained"
        onPress={onSubmit}
        style={styles.searchButton}
        contentStyle={styles.searchButtonContent}
      >
        Go
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  searchShell: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.surface.input,
    flex: 1,
    fontSize: typography.bodyMedium.fontSize,
    height: sizes.buttonHeight + 4,
    minWidth: 0,
  },
  searchInputOutline: {
    borderRadius: radius.pill,
  },
  searchButton: {
    backgroundColor: colors.surface.inverse,
    borderRadius: radius.pill,
  },
  searchButtonContent: {
    minHeight: sizes.buttonHeight + 4,
    paddingHorizontal: spacing.sm,
  },
  searchButtonLabel: {
    ...typography.button,
  },
});
