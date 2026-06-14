import { makePlan } from "@whittle/shared";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const previewPlan = makePlan();

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Whittle</Text>
        <Text style={styles.title}>Six techniques, one honest level jump.</Text>
        <Text style={styles.subtitle}>
          The mobile shell is wired to the shared domain model. Next we turn this into the wizard
          and plan review flow.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Shared preview plan</Text>
        <View style={styles.cardTitleRow}>
          <Text style={styles.emoji}>{previewPlan.emoji}</Text>
          <Text style={styles.cardTitle}>{previewPlan.hobby}</Text>
        </View>
        <Text style={styles.cardText}>{previewPlan.rationale}</Text>
        <Text style={styles.cardMeta}>{previewPlan.techniques.length} techniques ready</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f3ea",
    gap: 28,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    gap: 12,
  },
  eyebrow: {
    color: "#8a4b2a",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#1f2933",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 42,
  },
  subtitle: {
    color: "#56616f",
    fontSize: 17,
    lineHeight: 25,
  },
  card: {
    backgroundColor: "#fffdf8",
    borderColor: "#dacdb8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  cardLabel: {
    color: "#7d6b57",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    color: "#1f2933",
    fontSize: 24,
    fontWeight: "800",
  },
  cardText: {
    color: "#46515e",
    fontSize: 16,
    lineHeight: 23,
  },
  cardMeta: {
    color: "#256c63",
    fontSize: 15,
    fontWeight: "700",
  },
});
