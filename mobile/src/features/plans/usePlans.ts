import {
  computeProgress,
  type GeneratePlanInput,
  type Plan,
  type ProgressSummary,
  type TechniqueStatus,
  type TechniqueUserState,
} from "@skillstep/shared";
import { useCallback, useEffect, useMemo, useState } from "react";

import { skillstepApi } from "../../api";
import {
  getPlans,
  getTechniqueUserStates,
  saveCurrentPlanForHobby,
  toggleMasteryCriterion,
  updateTechniqueStatus,
} from "../../db";

export interface UsePlansResult {
  errorMessage: string | null;
  generatePlan: (input: GeneratePlanInput) => Promise<boolean>;
  isGenerating: boolean;
  isLoading: boolean;
  plans: Plan[];
  progress: ProgressSummary | null;
  progressByPlanId: Record<string, ProgressSummary>;
  refreshPlans: () => Promise<void>;
  selectedPlan: Plan | null;
  selectedPlanStates: Record<string, TechniqueUserState>;
  selectPlan: (planId: string) => void;
  setTechniqueStatus: (techniqueId: string, status: TechniqueStatus) => Promise<void>;
  toggleCriterion: (criterionId: string) => Promise<void>;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanStates, setSelectedPlanStates] = useState<Record<string, TechniqueUserState>>(
    {},
  );
  const [progressByPlanId, setProgressByPlanId] = useState<Record<string, ProgressSummary>>({});
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

  useEffect(() => {
    let isMounted = true;

    async function loadPlanProgress() {
      try {
        const progressEntries = await Promise.all(
          plans.map(async (plan) => {
            const states = await getTechniqueUserStates(plan.id);
            return [plan.id, computeProgress(plan, states)] as const;
          }),
        );

        if (isMounted) {
          setProgressByPlanId(Object.fromEntries(progressEntries));
        }
      } catch (error) {
        if (isMounted) setErrorMessage(toErrorMessage(error));
      }
    }

    if (plans.length === 0) {
      setProgressByPlanId({});
      return;
    }

    loadPlanProgress();

    return () => {
      isMounted = false;
    };
  }, [plans]);

  const generatePlan = useCallback(
    async (input: GeneratePlanInput) => {
      setIsGenerating(true);
      setErrorMessage(null);

      try {
        const plan = await skillstepApi.plans.createPlan(input);
        await saveCurrentPlanForHobby(plan);
        await refreshPlans();
        setSelectedPlanId(plan.id);
        return true;
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
        return false;
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

  const refreshSelectedPlanProgress = useCallback(async () => {
    if (!selectedPlan) {
      setSelectedPlanStates({});
      return;
    }

    const states = await getTechniqueUserStates(selectedPlan.id);
    const nextProgress = computeProgress(selectedPlan, states);

    setSelectedPlanStates(states);
    setProgressByPlanId((currentProgress) => ({
      ...currentProgress,
      [selectedPlan.id]: nextProgress,
    }));
  }, [selectedPlan]);

  const setTechniqueStatus = useCallback(
    async (techniqueId: string, status: TechniqueStatus) => {
      setErrorMessage(null);

      try {
        await updateTechniqueStatus(techniqueId, status);
        await refreshSelectedPlanProgress();
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      }
    },
    [refreshSelectedPlanProgress],
  );

  const toggleCriterion = useCallback(
    async (criterionId: string) => {
      setErrorMessage(null);

      try {
        await toggleMasteryCriterion(criterionId);
        await refreshSelectedPlanProgress();
      } catch (error) {
        setErrorMessage(toErrorMessage(error));
      }
    },
    [refreshSelectedPlanProgress],
  );

  return {
    errorMessage,
    generatePlan,
    isGenerating,
    isLoading,
    plans,
    progress,
    progressByPlanId,
    refreshPlans,
    selectedPlan,
    selectedPlanStates,
    selectPlan: setSelectedPlanId,
    setTechniqueStatus,
    toggleCriterion,
  };
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
