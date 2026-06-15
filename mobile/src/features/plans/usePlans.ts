import {
  computeProgress,
  type GeneratePlanInput,
  type Plan,
  type ProgressSummary,
  type TechniqueUserState,
} from "@skillstep/shared";
import { useCallback, useEffect, useMemo, useState } from "react";

import { skillstepApi } from "../../api";
import { getPlans, getTechniqueUserStates, savePlan } from "../../db";

export interface UsePlansResult {
  errorMessage: string | null;
  generatePlan: (input: GeneratePlanInput) => Promise<void>;
  isGenerating: boolean;
  isLoading: boolean;
  plans: Plan[];
  progress: ProgressSummary | null;
  refreshPlans: () => Promise<void>;
  selectedPlan: Plan | null;
  selectedPlanStates: Record<string, TechniqueUserState>;
  selectPlan: (planId: string) => void;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanStates, setSelectedPlanStates] = useState<Record<string, TechniqueUserState>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );

  const refreshPlans = useCallback(async () => {
    setErrorMessage(null);
    const savedPlans = await getPlans();

    setPlans(savedPlans);
    setSelectedPlanId((currentPlanId) => {
      if (currentPlanId && savedPlans.some((plan) => plan.id === currentPlanId)) {
        return currentPlanId;
      }

      return savedPlans[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      try {
        await refreshPlans();
      } catch (error) {
        if (isMounted) setErrorMessage(toErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [refreshPlans]);

  useEffect(() => {
    let isMounted = true;

    async function loadSelectedPlanStates() {
      if (!selectedPlan) {
        setSelectedPlanStates({});
        return;
      }

      try {
        const states = await getTechniqueUserStates(selectedPlan.id);
        if (isMounted) setSelectedPlanStates(states);
      } catch (error) {
        if (isMounted) setErrorMessage(toErrorMessage(error));
      }
    }

    loadSelectedPlanStates();

    return () => {
      isMounted = false;
    };
  }, [selectedPlan]);

  const generatePlan = useCallback(
    async (input: GeneratePlanInput) => {
      setIsGenerating(true);
      setErrorMessage(null);

      try {
        const plan = await skillstepApi.plans.createPlan(input);
        await savePlan(plan);
        await refreshPlans();
        setSelectedPlanId(plan.id);
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      } finally {
        setIsGenerating(false);
      }
    },
    [refreshPlans],
  );

  const progress = useMemo(
    () => (selectedPlan ? computeProgress(selectedPlan, selectedPlanStates) : null),
    [selectedPlan, selectedPlanStates],
  );

  return {
    errorMessage,
    generatePlan,
    isGenerating,
    isLoading,
    plans,
    progress,
    refreshPlans,
    selectedPlan,
    selectedPlanStates,
    selectPlan: setSelectedPlanId,
  };
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
