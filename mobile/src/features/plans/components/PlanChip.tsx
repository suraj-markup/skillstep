import type { Plan } from "@skillstep/shared";
import { Pressable, Text } from "react-native";

import { planIcons } from "../planIcons";
import { colors, styles } from "../styles";

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
      <Icon color={isSelected ? colors.card : colors.sage} size={17} strokeWidth={2.5} />
      <Text style={[styles.planChipText, isSelected && styles.planChipTextSelected]}>
        {plan.hobby}
      </Text>
    </Pressable>
  );
}
