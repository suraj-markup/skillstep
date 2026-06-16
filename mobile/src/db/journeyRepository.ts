import {
  type DailySession,
  DailySessionSchema,
  type GeneratedJourney,
  GeneratedJourneySchema,
  type HobbyProfile,
  HobbyProfileSchema,
  type Journey,
  JourneySchema,
  type PracticeCard,
  PracticeCardSchema,
  type Project,
  ProjectSchema,
} from "@skillstep/shared";
import type { SQLiteDatabase } from "expo-sqlite";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type JourneyRow = {
  completed_at: string | null;
  created_at: string;
  current_session_index: number;
  duration_weeks: number;
  final_project_json: string | null;
  goal: string;
  hobby_profile_id: string;
  id: string;
  level_from: string;
  level_to: string;
  milestones_json: string;
  rationale: string;
  status: string;
  title: string;
  total_sessions: number;
};

export async function saveGeneratedJourney(generatedJourney: GeneratedJourney): Promise<void> {
  const validGeneratedJourney = GeneratedJourneySchema.parse(generatedJourney);

  await runDatabaseOperation(async (database) => {
    await database.withTransactionAsync(async () => {
      await writeHobbyProfile(database, validGeneratedJourney.hobbyProfile);
      await writeJourney(database, validGeneratedJourney.journey);
      await replaceSessions(
        database,
        validGeneratedJourney.journey.id,
        validGeneratedJourney.sessions,
      );
      await replacePracticeCards(
        database,
        validGeneratedJourney.journey.id,
        validGeneratedJourney.practiceCards,
      );
      await replaceProjects(
        database,
        validGeneratedJourney.journey.id,
        validGeneratedJourney.projects,
      );
    });
  });
}

export async function getJourneysForHobby(hobbyProfileId: string): Promise<Journey[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<JourneyRow>(
      `
      SELECT *
      FROM ${TABLES.journeys}
      WHERE hobby_profile_id = ?
      ORDER BY datetime(created_at) DESC;
      `,
      [hobbyProfileId],
    );

    return rows.map(mapJourneyRow);
  });
}

export async function getActiveJourneys(): Promise<Journey[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<JourneyRow>(
      `
      SELECT *
      FROM ${TABLES.journeys}
      WHERE status = 'active'
      ORDER BY datetime(created_at) DESC;
      `,
    );

    return rows.map(mapJourneyRow);
  });
}

export async function getJourneyById(journeyId: string): Promise<Journey | null> {
  return runDatabaseOperation(async (database) => {
    const row = await database.getFirstAsync<JourneyRow>(
      `
      SELECT *
      FROM ${TABLES.journeys}
      WHERE id = ?;
      `,
      [journeyId],
    );

    return row ? mapJourneyRow(row) : null;
  });
}

async function writeHobbyProfile(
  database: SQLiteDatabase,
  hobbyProfile: HobbyProfile,
): Promise<void> {
  const validProfile = HobbyProfileSchema.parse(hobbyProfile);

  await database.runAsync(
    `
    INSERT INTO ${TABLES.hobbyProfiles} (
      id,
      name,
      icon,
      accent,
      current_level,
      goal,
      status,
      preferred_minutes_per_day,
      preferred_days_per_week,
      preferred_learning_style,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      icon = excluded.icon,
      accent = excluded.accent,
      current_level = excluded.current_level,
      goal = excluded.goal,
      status = excluded.status,
      preferred_minutes_per_day = excluded.preferred_minutes_per_day,
      preferred_days_per_week = excluded.preferred_days_per_week,
      preferred_learning_style = excluded.preferred_learning_style,
      updated_at = excluded.updated_at;
    `,
    [
      validProfile.id,
      validProfile.name,
      validProfile.icon,
      validProfile.accent,
      validProfile.currentLevel,
      validProfile.goal,
      validProfile.status,
      validProfile.preferredMinutesPerDay,
      validProfile.preferredDaysPerWeek,
      validProfile.preferredLearningStyle,
      validProfile.createdAt,
      validProfile.updatedAt,
    ],
  );
}

async function writeJourney(database: SQLiteDatabase, journey: Journey): Promise<void> {
  const validJourney = JourneySchema.parse(journey);

  await database.runAsync(
    `
    INSERT INTO ${TABLES.journeys} (
      id,
      hobby_profile_id,
      title,
      level_from,
      level_to,
      goal,
      status,
      duration_weeks,
      total_sessions,
      current_session_index,
      milestones_json,
      final_project_json,
      rationale,
      created_at,
      completed_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      hobby_profile_id = excluded.hobby_profile_id,
      title = excluded.title,
      level_from = excluded.level_from,
      level_to = excluded.level_to,
      goal = excluded.goal,
      status = excluded.status,
      duration_weeks = excluded.duration_weeks,
      total_sessions = excluded.total_sessions,
      current_session_index = excluded.current_session_index,
      milestones_json = excluded.milestones_json,
      final_project_json = excluded.final_project_json,
      rationale = excluded.rationale,
      completed_at = excluded.completed_at;
    `,
    [
      validJourney.id,
      validJourney.hobbyProfileId,
      validJourney.title,
      validJourney.levelFrom,
      validJourney.levelTo,
      validJourney.goal,
      validJourney.status,
      validJourney.durationWeeks,
      validJourney.totalSessions,
      validJourney.currentSessionIndex,
      JSON.stringify(validJourney.milestones),
      validJourney.finalProject ? JSON.stringify(validJourney.finalProject) : null,
      validJourney.rationale,
      validJourney.createdAt,
      validJourney.completedAt,
    ],
  );
}

async function replaceSessions(
  database: SQLiteDatabase,
  journeyId: string,
  sessions: DailySession[],
): Promise<void> {
  await database.runAsync(`DELETE FROM ${TABLES.dailySessions} WHERE journey_id = ?;`, [journeyId]);

  for (const session of sessions) {
    const validSession = DailySessionSchema.parse(session);
    await database.runAsync(
      `
      INSERT INTO ${TABLES.dailySessions} (
        id,
        journey_id,
        hobby_profile_id,
        day_number,
        title,
        estimated_minutes,
        scheduled_for,
        status,
        learn,
        resource_json,
        practice,
        check_yourself_json,
        reflection_prompt,
        created_at,
        started_at,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        validSession.id,
        validSession.journeyId,
        validSession.hobbyProfileId,
        validSession.dayNumber,
        validSession.title,
        validSession.estimatedMinutes,
        validSession.scheduledFor,
        validSession.status,
        validSession.learn,
        validSession.resource ? JSON.stringify(validSession.resource) : null,
        validSession.practice,
        JSON.stringify(validSession.checkYourself),
        validSession.reflectionPrompt,
        validSession.createdAt,
        validSession.startedAt,
        validSession.completedAt,
      ],
    );
  }
}

async function replacePracticeCards(
  database: SQLiteDatabase,
  journeyId: string,
  practiceCards: PracticeCard[],
): Promise<void> {
  await database.runAsync(`DELETE FROM ${TABLES.practiceCards} WHERE journey_id = ?;`, [journeyId]);

  for (const card of practiceCards) {
    const validCard = PracticeCardSchema.parse(card);
    await database.runAsync(
      `
      INSERT INTO ${TABLES.practiceCards} (
        id,
        hobby_profile_id,
        journey_id,
        session_id,
        type,
        front,
        back,
        prompt,
        answer,
        difficulty,
        due_at,
        last_reviewed_at,
        review_count,
        correct_count,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        validCard.id,
        validCard.hobbyProfileId,
        validCard.journeyId,
        validCard.sessionId,
        validCard.type,
        validCard.front,
        validCard.back,
        validCard.prompt,
        validCard.answer,
        validCard.difficulty,
        validCard.dueAt,
        validCard.lastReviewedAt,
        validCard.reviewCount,
        validCard.correctCount,
        validCard.status,
        validCard.createdAt,
      ],
    );
  }
}

async function replaceProjects(
  database: SQLiteDatabase,
  journeyId: string,
  projects: Project[],
): Promise<void> {
  await database.runAsync(`DELETE FROM ${TABLES.projects} WHERE journey_id = ?;`, [journeyId]);

  for (const project of projects) {
    const validProject = ProjectSchema.parse(project);
    await database.runAsync(
      `
      INSERT INTO ${TABLES.projects} (
        id,
        hobby_profile_id,
        journey_id,
        title,
        description,
        success_criteria_json,
        status,
        created_at,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        validProject.id,
        validProject.hobbyProfileId,
        validProject.journeyId,
        validProject.title,
        validProject.description,
        JSON.stringify(validProject.successCriteria),
        validProject.status,
        validProject.createdAt,
        validProject.completedAt,
      ],
    );
  }
}

function mapJourneyRow(row: JourneyRow): Journey {
  return JourneySchema.parse({
    id: row.id,
    hobbyProfileId: row.hobby_profile_id,
    title: row.title,
    levelFrom: row.level_from,
    levelTo: row.level_to,
    goal: row.goal,
    status: row.status,
    durationWeeks: row.duration_weeks,
    totalSessions: row.total_sessions,
    currentSessionIndex: row.current_session_index,
    milestones: JSON.parse(row.milestones_json),
    finalProject: row.final_project_json ? JSON.parse(row.final_project_json) : null,
    rationale: row.rationale,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  });
}
