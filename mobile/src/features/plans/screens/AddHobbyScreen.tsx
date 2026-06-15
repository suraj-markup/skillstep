import type { PlanIcon } from "@skillstep/shared";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { radius } from "../../../theme/radius";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { HobbyCard } from "../components/HobbyCard";
import { HobbySearchBar } from "../components/HobbySearchBar";
import type { DefaultHobby } from "../defaultHobbies";

interface AddHobbyScreenProps {
  defaultHobbies: DefaultHobby[];
  onBack: () => void;
  onChangeSearch: (value: string) => void;
  onSearch: () => void;
  onSelectDefaultHobby: (hobby: string, icon: PlanIcon) => void;
  searchValue: string;
}

export function AddHobbyScreen({
  defaultHobbies,
  onBack,
  onChangeSearch,
  onSearch,
  onSelectDefaultHobby,
  searchValue,
}: AddHobbyScreenProps) {
  const isSearching = searchValue.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
        <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Add hobby</Text>
        <Text style={styles.title}>Search any hobby</Text>
        <Text style={styles.subtitle}>
          Use this when the hobby is not in the default list on your home screen.
        </Text>
      </View>

      <View style={styles.searchPanel}>
        <HobbySearchBar onChangeText={onChangeSearch} onSubmit={onSearch} value={searchValue} />
      </View>

      {!isSearching ? (
        <View style={styles.suggestionsSection}>
          <View style={styles.sectionTitleStack}>
            <Text style={styles.sectionTitle}>Default hobbies</Text>
            <Text style={styles.sectionSubtitle}>Pick one here, or search for something else.</Text>
          </View>
          <View style={styles.hobbyGrid}>
            {defaultHobbies.map((hobby) => (
              <HobbyCard
                description={hobby.description}
                icon={hobby.icon}
                key={hobby.name}
                name={hobby.name}
                onPress={() => onSelectDefaultHobby(hobby.name, hobby.icon)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
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
  backButtonText: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  container: {
    backgroundColor: colors.surface.card,
    flexGrow: 1,
    gap: spacing.panel,
    minHeight: "100%",
    padding: spacing.screen,
    paddingBottom: spacing.screenBottom,
    paddingTop: spacing.plansTop,
  },
  eyebrow: {
    color: colors.text.accent,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  header: {
    gap: spacing.xl,
  },
  hobbyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  searchPanel: {
    backgroundColor: colors.surface.successSoft,
    borderColor: colors.borders.success,
    borderRadius: 28,
    borderWidth: 1,
    padding: spacing.panel,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.muted,
  },
  sectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontSize: 21,
  },
  sectionTitleStack: {
    gap: spacing.sm,
  },
  suggestionsSection: {
    gap: spacing.xl,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
});
