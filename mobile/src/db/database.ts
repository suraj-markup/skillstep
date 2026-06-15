import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { runMigrations } from "./migrations";
import { DATABASE_NAME } from "./schema";

let databasePromise: Promise<SQLiteDatabase> | undefined;
let databaseQueue: Promise<void> = Promise.resolve();

export function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openDatabaseAsync(DATABASE_NAME).then(async (database) => {
    await runMigrations(database);
    return database;
  });
  return databasePromise;
}

export async function runDatabaseOperation<T>(
  operation: (database: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const queuedOperation = databaseQueue.then(() => runWithReleasedObjectRetry(operation));

  databaseQueue = queuedOperation.then(
    () => undefined,
    () => undefined,
  );

  return queuedOperation;
}

async function runWithReleasedObjectRetry<T>(
  operation: (database: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  try {
    return await operation(await getDatabase());
  } catch (error) {
    if (!isReleasedSharedObjectError(error)) {
      throw error;
    }

    databasePromise = undefined;
    return operation(await getDatabase());
  }
}

function isReleasedSharedObjectError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes("shared object that was already released")
  );
}
