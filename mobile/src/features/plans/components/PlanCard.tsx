import type { Plan } from "@skillstep/shared";
import { Text, View } from "react-native";

import { planIcons } from "../planIcons";
import { colors, styles } from "../styles";

interface PlanCardProps {
  plan: Plan;
  progressPercent: number;
}

export function PlanCard({ plan, progressPercent }: PlanCardProps) {
  const Icon = planIcons[plan.icon];

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Current plan</Text>
      <View style={styles.cardTitleRow}>
        <View style={styles.iconBadge}>
          <Icon color={colors.sage} size={24} strokeWidth={2.4} />
        </View>
        <View style={styles.cardTitleStack}>
          <Text style={styles.cardTitle}>{plan.hobby}</Text>
          <Text style={styles.cardMeta}>
            {plan.techniques.length} techniques - {progressPercent}% mastered
          </Text>
        </View>
      </View>
      <Text style={styles.cardText}>{plan.rationale}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.techniqueList}>
        {plan.techniques.map((technique, index) => (
          <View key={technique.id} style={styles.techniqueRow}>
            <Text style={styles.techniqueNumber}>{index + 1}</Text>
            <View style={styles.techniqueTextStack}>
              <Text style={styles.techniqueName}>{technique.name}</Text>
              <Text style={styles.techniqueMeta}>
                {technique.drill.minutesPerSession} min - {technique.drill.sessionsPerWeek}x/week
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
