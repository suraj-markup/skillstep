import type { Plan } from "@skillstep/shared";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { planIcons } from "../planIcons";

interface PlanChipProps {
  isSelected: boolean;
  onPress: () => void;
  plan: Plan;
}

export function PlanChip({ isSelected, onPress, plan }: PlanChipProps) {
  const Icon = planIcons[plan.icon];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.planChip, isSelected && styles.planChipSelected]}
    >
      <Icon
        color={isSelected ? colors.text.inverse : colors.action.primary}
        size={17}
        strokeWidth={2.5}
      />
      <Text style={[styles.planChipText, isSelected && styles.planChipTextSelected]}>
        {plan.hobby}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  planChip: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.borders.selected,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 38,
    paddingHorizontal: spacing.xl,
  },
  planChipSelected: {
    backgroundColor: colors.surface.inverse,
    borderColor: colors.surface.inverse,
  },
  planChipText: {
    ...typography.labelMedium,
    color: colors.text.success,
  },
  planChipTextSelected: {
    color: colors.text.inverse,
  },
});
