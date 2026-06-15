import { StatusBar } from "expo-status-bar";
import { ArrowLeft, SearchCheck } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

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
      <StatusBar style="dark" />
      <Pressable
        accessibilityRole="button"
        hitSlop={12}
        onPress={onCancel}
        style={styles.headerBack}
      >
        <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
        <Text style={styles.headerBackText}>Back</Text>
      </Pressable>

      <View style={styles.findingPanel}>
        <View style={styles.findingGlow} />
        <View style={styles.findingIconBadge}>
          <SearchCheck color={colors.surface.inverse} size={30} strokeWidth={2.4} />
        </View>
        <Text style={styles.findingEyebrow}>Finding recommendations</Text>
        <Text style={styles.findingTitle}>Looking for the best starting point for {hobby}.</Text>
        <Text style={styles.findingText}>
          Skillstep is preparing a focused path before asking for your exact level jump.
        </Text>
        <ActivityIndicator color={colors.action.primary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  findingContainer: {
    backgroundColor: colors.surface.card,
    flexGrow: 1,
    gap: spacing.panel,
    justifyContent: "flex-start",
    minHeight: "100%",
    padding: spacing.screen,
    paddingTop: spacing.plansTop,
  },
  headerBack: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.default,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.xl,
  },
  headerBackText: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  findingPanel: {
    alignItems: "flex-start",
    backgroundColor: colors.surface.successSoft,
    borderRadius: 36,
    gap: spacing.panel,
    overflow: "hidden",
    padding: spacing.panel + 4,
    position: "relative",
  },
  findingGlow: {
    backgroundColor: colors.surface.card,
    borderRadius: 90,
    height: 170,
    opacity: 0.44,
    position: "absolute",
    right: -64,
    top: -48,
    transform: [{ rotate: "-12deg" }],
    width: 200,
  },
  findingIconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.surface.card,
    borderRadius: radius.pill,
    borderWidth: 6,
    height: sizes.findingIconCircle + 12,
    justifyContent: "center",
    width: sizes.findingIconCircle + 12,
  },
  findingEyebrow: {
    ...typography.overline,
    color: colors.text.accent,
  },
  findingTitle: {
    ...typography.displaySmall,
    color: colors.text.primary,
    fontSize: 34,
    lineHeight: 40,
  },
  findingText: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
});
