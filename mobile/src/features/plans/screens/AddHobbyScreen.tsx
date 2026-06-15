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
  const searchQuery = searchValue.trim().toLowerCase();
  const isSearching = searchQuery.length > 0;
  const visibleHobbies = isSearching
    ? defaultHobbies.filter((hobby) => {
        const searchableText = `${hobby.name} ${hobby.description}`.toLowerCase();
        return searchableText.includes(searchQuery);
      })
    : defaultHobbies;
  const canCreateNewHobby = isSearching && visibleHobbies.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
        <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Search any hobby</Text>
        <Text style={styles.subtitle}>
          Use this when the hobby is not in the default list on your home screen.
        </Text>
      </View>

      <HobbySearchBar
        canSubmit={canCreateNewHobby}
        onChangeText={onChangeSearch}
        onSubmit={onSearch}
        submitLabel={canCreateNewHobby ? "Create" : "Go"}
        value={searchValue}
      />

      <View style={styles.suggestionsSection}>
        <View style={styles.sectionTitleStack}>
          <Text style={styles.sectionTitle}>
            {isSearching ? "Matching hobbies" : "Default hobbies"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {canCreateNewHobby
              ? "No match found. Create a new hobby from your search."
              : isSearching
                ? "Pick a match below. New hobbies are created only when there is no match."
                : "Pick one here, or search for something else."}
          </Text>
        </View>

        {visibleHobbies.length > 0 ? (
          <View style={styles.hobbyGrid}>
            {visibleHobbies.map((hobby) => (
              <HobbyCard
                description={hobby.description}
                icon={hobby.icon}
                key={hobby.name}
                name={hobby.name}
                onPress={() => onSelectDefaultHobby(hobby.name, hobby.icon)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No default match</Text>
            <Text style={styles.emptyText}>
              Tap Create to build a custom plan for “{searchValue.trim()}”.
            </Text>
          </View>
        )}
      </View>
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
    gap: spacing.xl,
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
    paddingTop: spacing.md,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text.primary,
  },
  emptyState: {
    backgroundColor: colors.surface.input,
    borderColor: colors.borders.default,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.panel,
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.muted,
  },
});
