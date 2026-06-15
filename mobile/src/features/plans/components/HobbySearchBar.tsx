import { Search } from "lucide-react-native";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { colors, styles } from "../styles";

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
        activeOutlineColor={colors.sage}
        left={
          <TextInput.Icon
            icon={({ size }) => <Search color={colors.tan} size={size} strokeWidth={2.4} />}
          />
        }
        mode="outlined"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        outlineColor={colors.border}
        outlineStyle={styles.searchInputOutline}
        placeholder="Search any hobby"
        placeholderTextColor="#9a8d7c"
        returnKeyType="go"
        style={styles.searchInput}
        textColor={colors.ink}
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
