import {
  type CardDifficulty,
  CardDifficultySchema,
  type PracticeCard,
  PracticeCardSchema,
} from "@skillstep/shared";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type PracticeCardRow = {
  answer: string | null;
  back: string;
  correct_count: number;
  created_at: string;
  difficulty: string;
  due_at: string;
  front: string;
  hobby_profile_id: string;
  id: string;
  journey_id: string;
  last_reviewed_at: string | null;
  prompt: string | null;
  review_count: number;
  session_id: string;
  status: string;
  type: string;
};

export async function getDuePracticeCards(nowIso: string): Promise<PracticeCard[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<PracticeCardRow>(
      `
      SELECT cards.*
      FROM ${TABLES.practiceCards} cards
      INNER JOIN ${TABLES.hobbyProfiles} hobbies
        ON hobbies.id = cards.hobby_profile_id
      INNER JOIN ${TABLES.journeys} journeys
        ON journeys.id = cards.journey_id
      WHERE hobbies.status = 'active'
        AND journeys.status = 'active'
        AND cards.status NOT IN ('archived', 'mastered')
        AND datetime(cards.due_at) <= datetime(?)
      ORDER BY datetime(cards.due_at) ASC;
      `,
      [nowIso],
    );

    return rows.map(mapPracticeCardRow);
  });
}

export async function getPracticeCardsForSession(sessionId: string): Promise<PracticeCard[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<PracticeCardRow>(
      `
      SELECT *
      FROM ${TABLES.practiceCards}
      WHERE session_id = ?
      ORDER BY datetime(created_at) ASC;
      `,
      [sessionId],
    );

    return rows.map(mapPracticeCardRow);
  });
}

export async function recordPracticeCardReview(
  cardId: string,
  difficulty: Exclude<CardDifficulty, "new">,
  wasCorrect: boolean,
): Promise<void> {
  const validDifficulty = CardDifficultySchema.parse(difficulty);
  if (validDifficulty === "new") {
    throw new Error("Practice card review difficulty cannot be new.");
  }
  const now = new Date();
  const dueAt = getNextDueDate(now, validDifficulty).toISOString();
  const nextStatus = validDifficulty === "easy" ? "reviewing" : "learning";

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      UPDATE ${TABLES.practiceCards}
      SET difficulty = ?,
          due_at = ?,
          last_reviewed_at = ?,
          review_count = review_count + 1,
          correct_count = correct_count + ?,
          status = ?
      WHERE id = ?;
      `,
      [validDifficulty, dueAt, now.toISOString(), wasCorrect ? 1 : 0, nextStatus, cardId],
    );
  });
}

function mapPracticeCardRow(row: PracticeCardRow): PracticeCard {
  return PracticeCardSchema.parse({
    id: row.id,
    hobbyProfileId: row.hobby_profile_id,
    journeyId: row.journey_id,
    sessionId: row.session_id,
    type: row.type,
    front: row.front,
    back: row.back,
    prompt: row.prompt,
    answer: row.answer,
    difficulty: row.difficulty,
    dueAt: row.due_at,
    lastReviewedAt: row.last_reviewed_at,
    reviewCount: row.review_count,
    correctCount: row.correct_count,
    status: row.status,
    createdAt: row.created_at,
  });
}

function getNextDueDate(now: Date, difficulty: Exclude<CardDifficulty, "new">): Date {
  const nextDueDate = new Date(now);

  if (difficulty === "easy") {
    nextDueDate.setDate(nextDueDate.getDate() + 3);
  } else if (difficulty === "okay") {
    nextDueDate.setDate(nextDueDate.getDate() + 1);
  } else {
    nextDueDate.setHours(nextDueDate.getHours() + 8);
  }

  return nextDueDate;
}
