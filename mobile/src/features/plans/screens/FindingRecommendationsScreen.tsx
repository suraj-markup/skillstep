import { SearchCheck } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { styles } from "../styles";

interface FindingRecommendationsScreenProps {
  hobby: string;
  onCancel: () => void;
}

export function FindingRecommendationsScreen({
  hobby,
  onCancel,
}: FindingRecommendationsScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.findingContainer}>
      <View style={styles.findingPanel}>
        <View style={styles.findingIconBadge}>
          <SearchCheck color={colors.sage} size={28} strokeWidth={2.4} />
        </View>
        <Text style={styles.findingEyebrow}>Finding recommendations</Text>
        <Text style={styles.findingTitle}>Looking for the best starting point for {hobby}.</Text>
        <Text style={styles.findingText}>
          Skillstep is preparing a focused path before asking for your exact level jump.
        </Text>
        <ActivityIndicator color={colors.sage} />
      </View>

      <Button
        labelStyle={styles.findingCancelLabel}
        mode="outlined"
        onPress={onCancel}
        style={styles.findingCancelButton}
        contentStyle={styles.findingCancelContent}
      >
        Back to hobbies
      </Button>
    </ScrollView>
  );
}
