import type { PlanIcon } from "./domain";

const EXACT_HOBBY_ICONS: Record<string, PlanIcon> = {
  basketball: "sports",
  chess: "strategy",
  "coffee brewing": "coffee",
  "content creation": "content",
  cooking: "cooking",
  cycling: "cycling",
  dance: "dance",
  drawing: "art",
  fitness: "fitness",
  gardening: "gardening",
  "graphic design": "design",
  guitar: "guitar",
  "language learning": "language",
  photography: "camera",
  poker: "cards",
  reading: "reading",
  running: "running",
  singing: "singing",
  swimming: "swimming",
  tennis: "tennis",
  travel: "travel",
  videography: "video",
  yoga: "yoga",
};

const HOBBY_ICON_RULES: Array<{ icon: PlanIcon; keywords: string[] }> = [
  { icon: "strategy", keywords: ["chess", "strategy", "board game", "sudoku"] },
  { icon: "cards", keywords: ["poker", "cards", "card game"] },
  { icon: "cooking", keywords: ["cook", "bake", "food", "recipe", "chef", "meal"] },
  { icon: "coffee", keywords: ["coffee", "brew", "barista", "espresso"] },
  { icon: "guitar", keywords: ["guitar", "ukulele", "instrument"] },
  { icon: "music", keywords: ["music", "piano", "keyboard", "drums", "violin"] },
  { icon: "singing", keywords: ["sing", "vocal", "voice"] },
  { icon: "camera", keywords: ["photo", "photography", "camera"] },
  { icon: "video", keywords: ["video", "film", "videography", "cinema"] },
  { icon: "content", keywords: ["content", "youtube", "reel", "creator", "editing"] },
  { icon: "fitness", keywords: ["fitness", "gym", "workout", "strength", "mobility"] },
  { icon: "running", keywords: ["run", "running", "marathon", "jog"] },
  { icon: "cycling", keywords: ["cycle", "cycling", "bike", "biking"] },
  { icon: "swimming", keywords: ["swim", "swimming"] },
  { icon: "tennis", keywords: ["tennis", "badminton", "pickleball", "racket"] },
  { icon: "sports", keywords: ["sport", "basketball", "football", "soccer", "cricket"] },
  { icon: "yoga", keywords: ["yoga", "meditation", "stretch", "pilates"] },
  { icon: "dance", keywords: ["dance", "dancing", "choreo"] },
  { icon: "gardening", keywords: ["garden", "gardening", "plant", "soil"] },
  {
    icon: "language",
    keywords: ["language", "spanish", "french", "english", "japanese", "korean"],
  },
  { icon: "writing", keywords: ["write", "writing", "journal", "blog", "poetry", "story"] },
  { icon: "reading", keywords: ["read", "reading", "book"] },
  { icon: "art", keywords: ["draw", "drawing", "paint", "painting", "sketch", "illustration"] },
  { icon: "design", keywords: ["design", "ui", "ux", "lettering", "typography"] },
  { icon: "gaming", keywords: ["game", "gaming", "esport"] },
  { icon: "travel", keywords: ["travel", "travelling", "hiking", "trekking"] },
  { icon: "cars", keywords: ["car", "cars", "automobile", "driving"] },
];

export function resolveHobbyIcon(hobby: string, fallback: PlanIcon = "sparkles"): PlanIcon {
  const normalizedHobby = normalizeHobbyText(hobby);
  const exactIcon = EXACT_HOBBY_ICONS[normalizedHobby];

  if (exactIcon) {
    return exactIcon;
  }

  for (const rule of HOBBY_ICON_RULES) {
    if (rule.keywords.some((keyword) => matchesKeyword(normalizedHobby, keyword))) {
      return rule.icon;
    }
  }

  return fallback;
}

function matchesKeyword(value: string, keyword: string): boolean {
  const normalizedKeyword = normalizeHobbyText(keyword);

  if (normalizedKeyword.includes(" ")) {
    return value.includes(normalizedKeyword);
  }

  return value.split(" ").includes(normalizedKeyword);
}

function normalizeHobbyText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
