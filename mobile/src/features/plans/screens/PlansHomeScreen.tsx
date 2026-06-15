import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

import { OnboardingScreen } from "../../onboarding/screens/OnboardingScreen";
import { LoadingPlansRow } from "../components/LoadingPlansRow";
import { PlanCard } from "../components/PlanCard";
import { PlanChip } from "../components/PlanChip";
import { StatusNotice } from "../components/StatusNotice";
import { styles } from "../styles";
import { usePlans } from "../usePlans";

export function PlansHomeScreen() {
  const {
    errorMessage,
    generatePlan,
    isGenerating,
    isLoading,
    plans,
    progress,
    selectedPlan,
    selectPlan,
  } = usePlans();

  if (!isLoading && plans.length === 0) {
    return (
      <OnboardingScreen
        errorMessage={errorMessage}
        isGenerating={isGenerating}
        onSubmit={generatePlan}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Skillstep</Text>
        <Text style={styles.title}>Six techniques, one honest level jump.</Text>
        <Text style={styles.subtitle}>Small, practice-first plans saved on your device.</Text>
      </View>

      {errorMessage ? <StatusNotice message={errorMessage} /> : null}

      {isLoading ? <LoadingPlansRow /> : null}

      {!isLoading && plans.length > 0 ? (
        <View style={styles.planSwitcher}>
          {plans.map((plan) => (
            <PlanChip
              isSelected={selectedPlan?.id === plan.id}
              key={plan.id}
              onPress={() => selectPlan(plan.id)}
              plan={plan}
            />
          ))}
        </View>
      ) : null}

      {selectedPlan ? (
        <PlanCard plan={selectedPlan} progressPercent={progress?.percent ?? 0} />
      ) : null}
    </ScrollView>
  );
}
