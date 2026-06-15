import { SearchCheck } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { sizes } from "../../../theme/sizes";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

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
          <SearchCheck color={colors.action.primary} size={28} strokeWidth={2.4} />
        </View>
        <Text style={styles.findingEyebrow}>Finding recommendations</Text>
        <Text style={styles.findingTitle}>Looking for the best starting point for {hobby}.</Text>
        <Text style={styles.findingText}>
          Skillstep is preparing a focused path before asking for your exact level jump.
        </Text>
        <ActivityIndicator color={colors.action.primary} />
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

const styles = StyleSheet.create({
  findingContainer: {
    backgroundColor: colors.surface.app,
    flexGrow: 1,
    gap: spacing.panel,
    justifyContent: "center",
    minHeight: "100%",
    padding: spacing.screen,
  },
  findingPanel: {
    alignItems: "flex-start",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxl,
    padding: 22,
  },
  findingIconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: sizes.findingIconCircle,
    justifyContent: "center",
    width: sizes.findingIconCircle,
  },
  findingEyebrow: {
    ...typography.overline,
    color: colors.text.accent,
  },
  findingTitle: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
  findingText: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  findingCancelButton: {
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.md,
  },
  findingCancelContent: {
    minHeight: sizes.compactButtonHeight,
  },
  findingCancelLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "800",
  },
});
