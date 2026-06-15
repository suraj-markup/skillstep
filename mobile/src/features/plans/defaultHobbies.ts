import type { PlanIcon } from "@skillstep/shared";

export interface DefaultHobby {
  description: string;
  icon: PlanIcon;
  name: string;
}

export const DEFAULT_HOBBIES: DefaultHobby[] = [
  {
    description: "Tactics, board vision, and calmer decisions.",
    icon: "strategy",
    name: "Chess",
  },
  {
    description: "Chord changes, rhythm, and full-song confidence.",
    icon: "guitar",
    name: "Guitar",
  },
  {
    description: "Composition, light, editing, and better shoots.",
    icon: "camera",
    name: "Photography",
  },
  {
    description: "Technique, timing, flavor, and repeatable meals.",
    icon: "cooking",
    name: "Cooking",
  },
  {
    description: "Strength, stamina, mobility, and consistency.",
    icon: "fitness",
    name: "Fitness",
  },
  {
    description: "Sketching, color, observation, and finished pieces.",
    icon: "art",
    name: "Drawing",
  },
];
