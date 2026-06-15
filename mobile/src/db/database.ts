import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { runMigrations } from "./migrations";
import { DATABASE_NAME } from "./schema";

let databasePromise: Promise<SQLiteDatabase> | undefined;

export function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openDatabaseAsync(DATABASE_NAME).then(async (database) => {
    await runMigrations(database);
    return database;
  });
  return databasePromise;
}
