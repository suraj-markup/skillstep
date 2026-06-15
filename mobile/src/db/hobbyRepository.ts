import { type PlanIcon, resolveHobbyIcon } from "@skillstep/shared";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

export interface UserHobby {
  createdAt: string;
  id: string;
  icon: PlanIcon;
  name: string;
  source: "default" | "search";
  updatedAt: string;
}

type UserHobbyRow = {
  created_at: string;
  id: string;
  icon: PlanIcon;
  name: string;
  source: UserHobby["source"];
  updated_at: string;
};

export async function getUserHobbies(): Promise<UserHobby[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<UserHobbyRow>(
      `
      SELECT id, name, source, icon, created_at, updated_at
      FROM ${TABLES.userHobbies}
      ORDER BY datetime(updated_at) DESC;
      `,
    );

    return rows.map((row) => ({
      createdAt: row.created_at,
      id: row.id,
      icon: row.icon,
      name: row.name,
      source: row.source,
      updatedAt: row.updated_at,
    }));
  });
}

export async function saveUserHobby(input: {
  icon?: PlanIcon;
  name: string;
  source: UserHobby["source"];
}): Promise<UserHobby> {
  const now = new Date().toISOString();
  const name = normalizeHobbyName(input.name);
  const id = slugify(name);
  const icon = input.icon ?? resolveHobbyIcon(name);

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      INSERT INTO ${TABLES.userHobbies} (
        id,
        name,
        source,
        icon,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        source = excluded.source,
        icon = excluded.icon,
        updated_at = excluded.updated_at;
      `,
      [id, name, input.source, icon, now, now],
    );
  });

  return {
    createdAt: now,
    id,
    icon,
    name,
    source: input.source,
    updatedAt: now,
  };
}

function normalizeHobbyName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "hobby"
  );
}
