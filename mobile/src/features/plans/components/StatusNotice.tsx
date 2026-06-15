import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

interface StatusNoticeProps {
  message: string;
}

export function StatusNotice({ message }: StatusNoticeProps) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Could not finish that request</Text>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.feedback.dangerBackground,
    borderColor: colors.borders.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xxl,
  },
  noticeTitle: {
    ...typography.labelMedium,
    color: colors.feedback.dangerTitle,
  },
  noticeText: {
    ...typography.bodyMedium,
    color: colors.feedback.dangerText,
    fontSize: typography.labelMedium.fontSize,
  },
});
