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
  {
    description: "Bluff timing, pot odds, bankroll discipline, and review.",
    icon: "cards",
    name: "Poker",
  },
  {
    description: "Vocabulary, pronunciation, listening, and daily speaking.",
    icon: "book",
    name: "Language learning",
  },
  {
    description: "Breath control, tone, pitch, and confident song practice.",
    icon: "guitar",
    name: "Singing",
  },
  {
    description: "Short-form ideas, editing rhythm, lighting, and consistency.",
    icon: "camera",
    name: "Content creation",
  },
  {
    description: "Posture, flexibility, balance, and calm repeatable sessions.",
    icon: "fitness",
    name: "Yoga",
  },
  {
    description: "Creative prompts, structure, revision, and finished pieces.",
    icon: "book",
    name: "Creative writing",
  },
  {
    description: "Beat, coordination, musicality, and short choreography.",
    icon: "fitness",
    name: "Dance",
  },
  {
    description: "Plant care, soil, watering rhythm, and seasonal routines.",
    icon: "sparkles",
    name: "Gardening",
  },
  {
    description: "Brewing variables, tasting notes, recipes, and consistency.",
    icon: "cooking",
    name: "Coffee brewing",
  },
  {
    description: "Composition, color, lettering, and reusable design taste.",
    icon: "art",
    name: "Graphic design",
  },
  {
    description: "Openings, movement, serve rhythm, and match confidence.",
    icon: "fitness",
    name: "Tennis",
  },
  {
    description: "Observation, editing, storytelling, and stronger visual taste.",
    icon: "camera",
    name: "Videography",
  },
];
