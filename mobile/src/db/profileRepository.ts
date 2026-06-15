import { getDatabase } from "./database";
import { TABLES } from "./schema";

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

type UserProfileRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const LOCAL_PROFILE_ID = "local-user";

export async function getUserProfile(): Promise<UserProfile | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<UserProfileRow>(
    `
    SELECT id, name, created_at, updated_at
    FROM ${TABLES.userProfile}
    WHERE id = ?;
    `,
    [LOCAL_PROFILE_ID],
  );

  return row ? mapUserProfileRow(row) : null;
}

export async function saveUserProfile(name: string): Promise<UserProfile> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const trimmedName = name.trim();

  await database.runAsync(
    `
    INSERT INTO ${TABLES.userProfile} (
      id,
      name,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      updated_at = excluded.updated_at;
    `,
    [LOCAL_PROFILE_ID, trimmedName, now, now],
  );

  return {
    id: LOCAL_PROFILE_ID,
    name: trimmedName,
    createdAt: now,
    updatedAt: now,
  };
}

function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
