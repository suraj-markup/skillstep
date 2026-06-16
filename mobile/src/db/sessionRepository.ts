import {
  type DailySession,
  DailySessionSchema,
  type SessionReflection,
  SessionReflectionSchema,
  type SessionStatus,
  SessionStatusSchema,
} from "@skillstep/shared";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type DailySessionRow = {
  check_yourself_json: string;
  completed_at: string | null;
  created_at: string;
  day_number: number;
  estimated_minutes: number;
  hobby_profile_id: string;
  id: string;
  journey_id: string;
  learn: string;
  practice: string;
  reflection_prompt: string;
  resource_json: string | null;
  scheduled_for: string | null;
  started_at: string | null;
  status: string;
  title: string;
};

type SessionReflectionRow = {
  created_at: string;
  difficulty: string;
  felt_easy: string | null;
  felt_hard: string | null;
  hobby_profile_id: string;
  id: string;
  journey_id: string;
  notes: string;
  session_id: string;
  should_revisit: number;
};

export async function getSessionsForJourney(journeyId: string): Promise<DailySession[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<DailySessionRow>(
      `
      SELECT *
      FROM ${TABLES.dailySessions}
      WHERE journey_id = ?
      ORDER BY day_number ASC;
      `,
      [journeyId],
    );

    return rows.map(mapDailySessionRow);
  });
}

export async function getSessionById(sessionId: string): Promise<DailySession | null> {
  return runDatabaseOperation(async (database) => {
    const row = await database.getFirstAsync<DailySessionRow>(
      `
      SELECT *
      FROM ${TABLES.dailySessions}
      WHERE id = ?;
      `,
      [sessionId],
    );

    return row ? mapDailySessionRow(row) : null;
  });
}

export async function getAvailableSessions(): Promise<DailySession[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<DailySessionRow>(
      `
      SELECT sessions.*
      FROM ${TABLES.dailySessions} sessions
      INNER JOIN ${TABLES.hobbyProfiles} hobbies
        ON hobbies.id = sessions.hobby_profile_id
      INNER JOIN ${TABLES.journeys} journeys
        ON journeys.id = sessions.journey_id
      WHERE hobbies.status = 'active'
        AND journeys.status = 'active'
        AND sessions.status IN ('available', 'in_progress', 'missed')
      ORDER BY
        CASE sessions.status
          WHEN 'in_progress' THEN 0
          WHEN 'missed' THEN 1
          ELSE 2
        END,
        sessions.scheduled_for ASC,
        sessions.day_number ASC;
      `,
    );

    return rows.map(mapDailySessionRow);
  });
}

export async function updateDailySessionStatus(
  sessionId: string,
  status: SessionStatus,
): Promise<void> {
  const validStatus = SessionStatusSchema.parse(status);
  const now = new Date().toISOString();

  await runDatabaseOperation(async (database) => {
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `
        UPDATE ${TABLES.dailySessions}
        SET status = ?,
            started_at = CASE
              WHEN ? = 'in_progress' AND started_at IS NULL THEN ?
              ELSE started_at
            END,
            completed_at = CASE
              WHEN ? = 'completed' THEN ?
              ELSE completed_at
            END
        WHERE id = ?;
        `,
        [validStatus, validStatus, now, validStatus, now, sessionId],
      );

      if (validStatus === "completed") {
        await database.runAsync(
          `
          UPDATE ${TABLES.dailySessions}
          SET status = 'available'
          WHERE id = (
            SELECT next_session.id
            FROM ${TABLES.dailySessions} completed_session
            INNER JOIN ${TABLES.dailySessions} next_session
              ON next_session.journey_id = completed_session.journey_id
             AND next_session.day_number > completed_session.day_number
            WHERE completed_session.id = ?
              AND next_session.status = 'locked'
            ORDER BY next_session.day_number ASC
            LIMIT 1
          );
          `,
          [sessionId],
        );
      }
    });
  });
}

export async function saveSessionReflection(reflection: SessionReflection): Promise<void> {
  const validReflection = SessionReflectionSchema.parse(reflection);

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      INSERT INTO ${TABLES.sessionReflections} (
        id,
        session_id,
        hobby_profile_id,
        journey_id,
        difficulty,
        notes,
        felt_easy,
        felt_hard,
        should_revisit,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        difficulty = excluded.difficulty,
        notes = excluded.notes,
        felt_easy = excluded.felt_easy,
        felt_hard = excluded.felt_hard,
        should_revisit = excluded.should_revisit,
        created_at = excluded.created_at;
      `,
      [
        validReflection.id,
        validReflection.sessionId,
        validReflection.hobbyProfileId,
        validReflection.journeyId,
        validReflection.difficulty,
        validReflection.notes,
        validReflection.feltEasy,
        validReflection.feltHard,
        validReflection.shouldRevisit ? 1 : 0,
        validReflection.createdAt,
      ],
    );
  });
}

export async function getReflectionForSession(
  sessionId: string,
): Promise<SessionReflection | null> {
  return runDatabaseOperation(async (database) => {
    const row = await database.getFirstAsync<SessionReflectionRow>(
      `
      SELECT *
      FROM ${TABLES.sessionReflections}
      WHERE session_id = ?
      ORDER BY datetime(created_at) DESC
      LIMIT 1;
      `,
      [sessionId],
    );

    return row ? mapSessionReflectionRow(row) : null;
  });
}

function mapDailySessionRow(row: DailySessionRow): DailySession {
  return DailySessionSchema.parse({
    id: row.id,
    journeyId: row.journey_id,
    hobbyProfileId: row.hobby_profile_id,
    dayNumber: row.day_number,
    title: row.title,
    estimatedMinutes: row.estimated_minutes,
    scheduledFor: row.scheduled_for,
    status: row.status,
    learn: row.learn,
    resource: row.resource_json ? JSON.parse(row.resource_json) : null,
    practice: row.practice,
    checkYourself: JSON.parse(row.check_yourself_json),
    reflectionPrompt: row.reflection_prompt,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  });
}

function mapSessionReflectionRow(row: SessionReflectionRow): SessionReflection {
  return SessionReflectionSchema.parse({
    id: row.id,
    sessionId: row.session_id,
    hobbyProfileId: row.hobby_profile_id,
    journeyId: row.journey_id,
    difficulty: row.difficulty,
    notes: row.notes,
    feltEasy: row.felt_easy,
    feltHard: row.felt_hard,
    shouldRevisit: row.should_revisit === 1,
    createdAt: row.created_at,
  });
}
