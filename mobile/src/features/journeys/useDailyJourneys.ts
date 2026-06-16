import type {
  CardDifficulty,
  DailySession,
  GenerateJourneyInput,
  HobbyProfile,
  Journey,
  PracticeCard,
  SessionReflection,
  SessionStatus,
} from "@skillstep/shared";
import { useCallback, useEffect, useMemo, useState } from "react";

import { skillstepApi } from "../../api";
import {
  getActiveJourneys,
  getAvailableSessions,
  getDuePracticeCards,
  getHobbyProfiles,
  recordPracticeCardReview,
  saveGeneratedJourney,
  saveSessionReflection,
  updateDailySessionStatus,
} from "../../db";

export interface UseDailyJourneysResult {
  activeJourneys: Journey[];
  dueCards: PracticeCard[];
  errorMessage: string | null;
  generateJourney: (input: GenerateJourneyInput) => Promise<boolean>;
  hobbyProfiles: HobbyProfile[];
  isGenerating: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  reviewCard: (
    cardId: string,
    difficulty: Exclude<CardDifficulty, "new">,
    wasCorrect: boolean,
  ) => Promise<void>;
  saveReflection: (reflection: SessionReflection) => Promise<void>;
  todaySessions: DailySession[];
  updateSessionStatus: (sessionId: string, status: SessionStatus) => Promise<void>;
}

export function useDailyJourneys(): UseDailyJourneysResult {
  const [hobbyProfiles, setHobbyProfiles] = useState<HobbyProfile[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [todaySessions, setTodaySessions] = useState<DailySession[]>([]);
  const [dueCards, setDueCards] = useState<PracticeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setErrorMessage(null);

    const [profiles, journeys, sessions, cards] = await Promise.all([
      getHobbyProfiles(),
      getActiveJourneys(),
      getAvailableSessions(),
      getDuePracticeCards(new Date().toISOString()),
    ]);

    setHobbyProfiles(profiles);
    setActiveJourneys(journeys);
    setTodaySessions(sessions);
    setDueCards(cards);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await refresh();
      } catch (error) {
        if (isMounted) setErrorMessage(toErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const generateJourney = useCallback(
    async (input: GenerateJourneyInput) => {
      setIsGenerating(true);
      setErrorMessage(null);

      try {
        const generatedJourney = await skillstepApi.journeys.createJourney(input);
        await saveGeneratedJourney(generatedJourney);
        await refresh();
        return true;
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    [refresh],
  );

  const updateSessionStatus = useCallback(
    async (sessionId: string, status: SessionStatus) => {
      setErrorMessage(null);

      try {
        await updateDailySessionStatus(sessionId, status);
        await refresh();
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      }
    },
    [refresh],
  );

  const saveReflection = useCallback(
    async (reflection: SessionReflection) => {
      setErrorMessage(null);

      try {
        await saveSessionReflection(reflection);
        await refresh();
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      }
    },
    [refresh],
  );

  const reviewCard = useCallback(
    async (cardId: string, difficulty: Exclude<CardDifficulty, "new">, wasCorrect: boolean) => {
      setErrorMessage(null);

      try {
        await recordPracticeCardReview(cardId, difficulty, wasCorrect);
        await refresh();
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      }
    },
    [refresh],
  );

  return useMemo(
    () => ({
      activeJourneys,
      dueCards,
      errorMessage,
      generateJourney,
      hobbyProfiles,
      isGenerating,
      isLoading,
      refresh,
      reviewCard,
      saveReflection,
      todaySessions,
      updateSessionStatus,
    }),
    [
      activeJourneys,
      dueCards,
      errorMessage,
      generateJourney,
      hobbyProfiles,
      isGenerating,
      isLoading,
      refresh,
      reviewCard,
      saveReflection,
      todaySessions,
      updateSessionStatus,
    ],
  );
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
