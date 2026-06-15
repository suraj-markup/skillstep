import type { PlanIcon } from "@skillstep/shared";

import { getDatabase } from "./database";
import { TABLES } from "./schema";

export interface UserHobby {
  id: string;
  icon: PlanIcon;
  name: string;
  source: "default" | "search";
}

type UserHobbyRow = {
  id: string;
  icon: PlanIcon;
  name: string;
  source: UserHobby["source"];
};

export async function getUserHobbies(): Promise<UserHobby[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<UserHobbyRow>(
    `
    SELECT id, name, source, icon
    FROM ${TABLES.userHobbies}
    ORDER BY datetime(updated_at) DESC;
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    name: row.name,
    source: row.source,
  }));
}

export async function saveUserHobby(input: {
  icon?: PlanIcon;
  name: string;
  source: UserHobby["source"];
}): Promise<UserHobby> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const name = normalizeHobbyName(input.name);
  const id = slugify(name);
  const icon = input.icon ?? "sparkles";

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

  return {
    id,
    icon,
    name,
    source: input.source,
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
