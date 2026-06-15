import { type GeneratePlanInput, GeneratePlanInputSchema } from "@skillstep/shared";
import { useMemo, useState } from "react";

export const ONBOARDING_STEP_COUNT = 4;

export interface OnboardingFormState {
  hobby: string;
  levelFrom: string;
  levelTo: string;
  weeklyHours: string;
}

export interface UseOnboardingFormResult {
  canGoBack: boolean;
  canGoForward: boolean;
  currentValue: string;
  form: OnboardingFormState;
  goBack: () => void;
  goForward: () => void;
  input: GeneratePlanInput | null;
  setCurrentValue: (value: string) => void;
  step: number;
}

const initialForm: OnboardingFormState = {
  hobby: "",
  levelFrom: "",
  levelTo: "",
  weeklyHours: "4",
};

export function useOnboardingForm(): UseOnboardingFormResult {
  const [form, setForm] = useState<OnboardingFormState>(initialForm);
  const [step, setStep] = useState(0);

  const currentValue = readStepValue(form, step);
  const input = useMemo(() => {
    const parsed = GeneratePlanInputSchema.safeParse({
      hobby: form.hobby,
      levelFrom: form.levelFrom,
      levelTo: form.levelTo,
      weeklyHours: Number(form.weeklyHours),
    });

    return parsed.success ? parsed.data : null;
  }, [form]);

  return {
    canGoBack: step > 0,
    canGoForward: isStepComplete(form, step),
    currentValue,
    form,
    goBack: () => setStep((currentStep) => Math.max(0, currentStep - 1)),
    goForward: () => setStep((currentStep) => Math.min(ONBOARDING_STEP_COUNT - 1, currentStep + 1)),
    input,
    setCurrentValue: (value) => setForm((currentForm) => writeStepValue(currentForm, step, value)),
    step,
  };
}

function readStepValue(form: OnboardingFormState, step: number): string {
  if (step === 0) return form.hobby;
  if (step === 1) return form.levelFrom;
  if (step === 2) return form.levelTo;
  return form.weeklyHours;
}

function writeStepValue(
  form: OnboardingFormState,
  step: number,
  value: string,
): OnboardingFormState {
  if (step === 0) return { ...form, hobby: value };
  if (step === 1) return { ...form, levelFrom: value };
  if (step === 2) return { ...form, levelTo: value };
  return { ...form, weeklyHours: value.replace(/[^\d.]/g, "") };
}

function isStepComplete(form: OnboardingFormState, step: number): boolean {
  if (step === 3) {
    const weeklyHours = Number(form.weeklyHours);
    return Number.isFinite(weeklyHours) && weeklyHours > 0 && weeklyHours <= 60;
  }

  return readStepValue(form, step).trim().length > 0;
}
