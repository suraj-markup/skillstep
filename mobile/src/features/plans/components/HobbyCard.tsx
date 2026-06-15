import type { PlanIcon } from "@skillstep/shared";
import { Pressable, Text, View } from "react-native";

import { planIcons } from "../planIcons";
import { colors, styles } from "../styles";

interface HobbyCardProps {
  description: string;
  icon: PlanIcon;
  name: string;
  onPress: () => void;
}

export function HobbyCard({ description, icon, name, onPress }: HobbyCardProps) {
  const Icon = planIcons[icon];

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.hobbyCard}>
      <View style={styles.iconBadge}>
        <Icon color={colors.sage} size={22} strokeWidth={2.4} />
      </View>
      <View style={styles.hobbyCardTextStack}>
        <Text style={styles.hobbyCardTitle}>{name}</Text>
        <Text style={styles.hobbyCardDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}
