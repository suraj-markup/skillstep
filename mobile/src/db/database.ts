import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { runMigrations } from "./migrations";
import { DATABASE_NAME } from "./schema";

const WEB_SQLITE_VFS_DIRECTORY = "expo-sqlite";
const WEB_SQLITE_RESET_STORAGE_KEY = "skillstep:web-sqlite-reset-at";
const WEB_SQLITE_RESET_COOLDOWN_MS = 10_000;

interface DatabaseState {
  promise?: Promise<SQLiteDatabase>;
  queue: Promise<void>;
}

declare global {
  // Keep one web SQLite connection alive across Fast Refresh/module reloads.
  // Opening the same OPFS database twice can trip createSyncAccessHandle.
  var __skillstepDatabaseState: DatabaseState | undefined;
}

if (!globalThis.__skillstepDatabaseState) {
  globalThis.__skillstepDatabaseState = {
    queue: Promise.resolve(),
  };
}

const databaseState = globalThis.__skillstepDatabaseState;

export function getDatabase(): Promise<SQLiteDatabase> {
  databaseState.promise ??= openDatabaseAsync(DATABASE_NAME)
    .then(async (database) => {
      await runMigrations(database);
      return database;
    })
    .catch((error) => {
      databaseState.promise = undefined;
      void recoverFromWebSqliteVfsError(error);
      throw error;
    });
  return databaseState.promise;
}

export async function runDatabaseOperation<T>(
  operation: (database: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const queuedOperation = databaseState.queue.then(() => runWithReleasedObjectRetry(operation));

  databaseState.queue = queuedOperation.then(
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

    databaseState.promise = undefined;
    return operation(await getDatabase());
  }
}

function isReleasedSharedObjectError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes("shared object that was already released")
  );
}

async function recoverFromWebSqliteVfsError(error: unknown): Promise<void> {
  if (Platform.OS !== "web" || !isWebSqliteVfsError(error) || !canUseBrowserStorage()) {
    return;
  }

  const now = Date.now();
  const lastReset = Number(localStorage.getItem(WEB_SQLITE_RESET_STORAGE_KEY) ?? 0);
  if (now - lastReset < WEB_SQLITE_RESET_COOLDOWN_MS) {
    return;
  }

  localStorage.setItem(WEB_SQLITE_RESET_STORAGE_KEY, String(now));
  await clearWebSqliteVfsDirectory();
  window.location.reload();
}

function isWebSqliteVfsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Invalid VFS state") ||
    error.message.includes("createSyncAccessHandle") ||
    error.message.includes("NoModificationAllowedError")
  );
}

function canUseBrowserStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function"
  );
}

async function clearWebSqliteVfsDirectory(): Promise<void> {
  const root = await navigator.storage.getDirectory();

  try {
    await root.removeEntry(WEB_SQLITE_VFS_DIRECTORY, { recursive: true });
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "NotFoundError") {
      throw error;
    }
  }
}
