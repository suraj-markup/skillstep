import type { DailySession, PracticeCard } from "./domain";

export interface JourneyProgressSummary {
  total: number;
  completed: number;
  skipped: number;
  missed: number;
  active: number;
  percent: number;
  nextSessionId: string | null;
}

export function computeJourneyProgress(sessions: DailySession[]): JourneyProgressSummary {
  const orderedSessions = [...sessions].sort((first, second) => first.dayNumber - second.dayNumber);
  let completed = 0;
  let skipped = 0;
  let missed = 0;

  for (const session of orderedSessions) {
    if (session.status === "completed") completed += 1;
    else if (session.status === "skipped") skipped += 1;
    else if (session.status === "missed") missed += 1;
  }

  const total = orderedSessions.length;
  const active = total - skipped;
  const percent = active === 0 ? 0 : Math.round((completed / active) * 100);
  const nextSession = orderedSessions.find((session) =>
    ["available", "in_progress", "missed"].includes(session.status),
  );

  return {
    total,
    completed,
    skipped,
    missed,
    active,
    percent,
    nextSessionId: nextSession?.id ?? null,
  };
}

export function isJourneyComplete(progress: JourneyProgressSummary): boolean {
  return progress.active > 0 && progress.completed === progress.active;
}

export function getDuePracticeCards(cards: PracticeCard[], nowIso: string): PracticeCard[] {
  const nowTime = Date.parse(nowIso);

  return cards
    .filter((card) => {
      if (card.status === "archived" || card.status === "mastered") {
        return false;
      }

      const dueTime = Date.parse(card.dueAt);
      return Number.isFinite(dueTime) && dueTime <= nowTime;
    })
    .sort((first, second) => Date.parse(first.dueAt) - Date.parse(second.dueAt));
}
