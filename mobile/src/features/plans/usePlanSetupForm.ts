import { type GeneratePlanInput, GeneratePlanInputSchema } from "@skillstep/shared";
import { useMemo, useState } from "react";

export interface PlanSetupFormState {
  levelFrom: string;
  levelTo: string;
  weeklyHours: string;
}

export interface UsePlanSetupFormResult {
  canSubmit: boolean;
  form: PlanSetupFormState;
  input: GeneratePlanInput | null;
  setLevelFrom: (value: string) => void;
  setLevelTo: (value: string) => void;
  setWeeklyHours: (value: string) => void;
}

export function usePlanSetupForm(hobby: string): UsePlanSetupFormResult {
  const [form, setForm] = useState<PlanSetupFormState>({
    levelFrom: "",
    levelTo: "",
    weeklyHours: "4",
  });

  const input = useMemo(() => {
    const parsed = GeneratePlanInputSchema.safeParse({
      hobby,
      levelFrom: form.levelFrom,
      levelTo: form.levelTo,
      weeklyHours: Number(form.weeklyHours),
    });

    return parsed.success ? parsed.data : null;
  }, [form, hobby]);

  return {
    canSubmit: input !== null,
    form,
    input,
    setLevelFrom: (value) => setForm((currentForm) => ({ ...currentForm, levelFrom: value })),
    setLevelTo: (value) => setForm((currentForm) => ({ ...currentForm, levelTo: value })),
    setWeeklyHours: (value) =>
      setForm((currentForm) => ({ ...currentForm, weeklyHours: value.replace(/[^\d.]/g, "") })),
  };
}
