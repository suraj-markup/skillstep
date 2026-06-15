import { Pressable, Text, View } from "react-native";

import { onboardingStyles } from "../styles";

interface SuggestionChipsProps {
  onSelect: (value: string) => void;
  suggestions: string[];
}

export function SuggestionChips({ onSelect, suggestions }: SuggestionChipsProps) {
  return (
    <View style={onboardingStyles.suggestions}>
      {suggestions.map((suggestion) => (
        <Pressable
          accessibilityRole="button"
          key={suggestion}
          onPress={() => onSelect(suggestion)}
          style={onboardingStyles.suggestionChip}
        >
          <Text style={onboardingStyles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </View>
  );
}
