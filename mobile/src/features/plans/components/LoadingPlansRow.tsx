import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export function LoadingPlansRow() {
  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator color={colors.action.primary} />
      <Text style={styles.loadingText}>Loading saved plans</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  loadingText: {
    color: colors.text.muted,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
  },
});
