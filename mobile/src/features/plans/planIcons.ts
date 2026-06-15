import type { PlanIcon } from "@skillstep/shared";
import {
  BookOpen,
  Camera,
  Club,
  CookingPot,
  Crown,
  Dumbbell,
  Guitar,
  Palette,
  Sparkles,
} from "lucide-react-native";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export const planIcons: Record<PlanIcon, IconComponent> = {
  art: Palette,
  book: BookOpen,
  camera: Camera,
  cards: Club,
  cooking: CookingPot,
  fitness: Dumbbell,
  guitar: Guitar,
  sparkles: Sparkles,
  strategy: Crown,
};
