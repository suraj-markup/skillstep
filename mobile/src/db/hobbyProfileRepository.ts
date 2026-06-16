import {
  type HobbyProfile,
  HobbyProfileSchema,
  type HobbyProfileStatus,
  HobbyProfileStatusSchema,
} from "@skillstep/shared";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type HobbyProfileRow = {
  accent: string;
  created_at: string;
  current_level: string;
  goal: string;
  icon: string;
  id: string;
  name: string;
  preferred_days_per_week: number;
  preferred_learning_style: string;
  preferred_minutes_per_day: number;
  status: string;
  updated_at: string;
};

export async function saveHobbyProfile(profile: HobbyProfile): Promise<void> {
  const validProfile = HobbyProfileSchema.parse(profile);

  await runDatabaseOperation(async (database) => {
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
  });
}

export async function getHobbyProfiles(): Promise<HobbyProfile[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<HobbyProfileRow>(
      `
      SELECT *
      FROM ${TABLES.hobbyProfiles}
      ORDER BY datetime(updated_at) DESC;
      `,
    );

    return rows.map(mapHobbyProfileRow);
  });
}

export async function getHobbyProfileById(hobbyProfileId: string): Promise<HobbyProfile | null> {
  return runDatabaseOperation(async (database) => {
    const row = await database.getFirstAsync<HobbyProfileRow>(
      `
      SELECT *
      FROM ${TABLES.hobbyProfiles}
      WHERE id = ?;
      `,
      [hobbyProfileId],
    );

    return row ? mapHobbyProfileRow(row) : null;
  });
}

export async function updateHobbyProfileStatus(
  hobbyProfileId: string,
  status: HobbyProfileStatus,
): Promise<void> {
  const validStatus = HobbyProfileStatusSchema.parse(status);

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      UPDATE ${TABLES.hobbyProfiles}
      SET status = ?,
          updated_at = ?
      WHERE id = ?;
      `,
      [validStatus, new Date().toISOString(), hobbyProfileId],
    );
  });
}

function mapHobbyProfileRow(row: HobbyProfileRow): HobbyProfile {
  return HobbyProfileSchema.parse({
    id: row.id,
    name: row.name,
    icon: row.icon,
    accent: row.accent,
    currentLevel: row.current_level,
    goal: row.goal,
    status: row.status,
    preferredMinutesPerDay: row.preferred_minutes_per_day,
    preferredDaysPerWeek: row.preferred_days_per_week,
    preferredLearningStyle: row.preferred_learning_style,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
