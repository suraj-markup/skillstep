import type { CardDifficulty, PracticeCard } from "@skillstep/shared";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { tapFeedback } from "../../../utils/haptics";
import { BackButton, EmptyPanel, ReviewActionButton } from "../components/JourneyUi";
import { styles } from "./styles";

export function ReviewScreen({
  cards,
  onBack,
  onReviewCard,
}: {
  cards: PracticeCard[];
  onBack: () => void;
  onReviewCard: (
    cardId: string,
    difficulty: Exclude<CardDifficulty, "new">,
    wasCorrect: boolean,
  ) => Promise<void>;
}) {
  const [reviewQueue] = useState(cards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const activeCard = reviewQueue[activeIndex] ?? null;

  async function submitReview(difficulty: Exclude<CardDifficulty, "new">) {
    if (!activeCard) {
      return;
    }

    await tapFeedback();
    await onReviewCard(activeCard.id, difficulty, difficulty !== "hard");
    setCompletedCount((count) => count + 1);
    setIsRevealed(false);
    setActiveIndex((index) => index + 1);
  }

  if (!activeCard) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />
        <BackButton onPress={onBack} />
        <EmptyPanel
          actionLabel="Back to Today"
          body={
            completedCount > 0
              ? `You cleared ${completedCount} review cards.`
              : "Complete sessions to create useful cards."
          }
          onAction={onBack}
          title={completedCount > 0 ? "Review complete" : "No cards due"}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <BackButton onPress={onBack} />
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>Review</Text>
        <Text style={styles.title}>
          Card {Math.min(activeIndex + 1, reviewQueue.length)} of {reviewQueue.length}
        </Text>
        <Text style={styles.subtitle}>Tap the card to reveal the answer.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsRevealed((revealed) => !revealed)}
        style={({ pressed }) => [styles.reviewCard, pressed ? styles.pressed : undefined]}
      >
        <Text style={styles.cardMeta}>{activeCard.type}</Text>
        <Text style={styles.reviewPrompt}>{isRevealed ? activeCard.back : activeCard.front}</Text>
        {activeCard.prompt || activeCard.answer ? (
          <Text style={styles.reviewSupport}>
            {isRevealed ? (activeCard.answer ?? activeCard.back) : activeCard.prompt}
          </Text>
        ) : null}
        <Text style={styles.reviewHint}>{isRevealed ? "How did it feel?" : "Tap to reveal"}</Text>
      </Pressable>

      <View style={styles.reviewActions}>
        <ReviewActionButton
          disabled={!isRevealed}
          label="Hard"
          onPress={() => void submitReview("hard")}
          tone="hard"
        />
        <ReviewActionButton
          disabled={!isRevealed}
          label="Okay"
          onPress={() => void submitReview("okay")}
          tone="okay"
        />
        <ReviewActionButton
          disabled={!isRevealed}
          label="Easy"
          onPress={() => void submitReview("easy")}
          tone="easy"
        />
      </View>
    </ScrollView>
  );
}
