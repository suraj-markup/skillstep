import { useMemo, useState } from "react";

export interface UseOnboardingFormResult {
  canContinue: boolean;
  name: string;
  setName: (name: string) => void;
}

export function useOnboardingForm(): UseOnboardingFormResult {
  const [name, setName] = useState("");

  return {
    canContinue: useMemo(() => name.trim().length > 0, [name]),
    name,
    setName,
  };
}
