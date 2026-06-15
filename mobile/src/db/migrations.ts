import type { SQLiteDatabase } from "expo-sqlite";

import { CREATE_INITIAL_SCHEMA_SQL, DATABASE_VERSION } from "./schema";

type UserVersionRow = {
  user_version: number;
};

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync("PRAGMA foreign_keys = ON;");

  const currentVersion = await getUserVersion(database);

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `Database version ${currentVersion} is newer than app-supported version ${DATABASE_VERSION}.`,
    );
  }

  if (currentVersion < 1) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(CREATE_INITIAL_SCHEMA_SQL);
      await database.execAsync("PRAGMA user_version = 1;");
    });
  }

  if (currentVersion < 2) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await database.execAsync("PRAGMA user_version = 2;");
    });
  }

  if (currentVersion < 3) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS user_hobbies (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          source TEXT NOT NULL,
          icon TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    });
  }
}

async function getUserVersion(database: SQLiteDatabase): Promise<number> {
  const row = await database.getFirstAsync<UserVersionRow>("PRAGMA user_version;");
  return row?.user_version ?? 0;
}
