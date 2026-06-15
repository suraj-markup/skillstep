export const DATABASE_NAME = "skillstep.db";
export const DATABASE_VERSION = 1;

export const TABLES = {
  plans: "plans",
  techniques: "techniques",
  masteryCriteria: "mastery_criteria",
  techniqueStates: "technique_states",
  techniqueContent: "technique_content",
} as const;

export const CREATE_INITIAL_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY NOT NULL,
  hobby TEXT NOT NULL,
  level_from TEXT NOT NULL,
  level_to TEXT NOT NULL,
  weekly_hours REAL NOT NULL,
  rationale TEXT NOT NULL,
  icon TEXT NOT NULL,
  accent TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS techniques (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  modality_video TEXT NOT NULL,
  modality_reading TEXT NOT NULL,
  modality_practice TEXT NOT NULL,
  drill_text TEXT NOT NULL,
  minutes_per_session INTEGER NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mastery_criteria (
  id TEXT PRIMARY KEY NOT NULL,
  technique_id TEXT NOT NULL,
  text TEXT NOT NULL,
  checked_at TEXT,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS technique_states (
  technique_id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS technique_content (
  technique_id TEXT PRIMARY KEY NOT NULL,
  primer TEXT,
  videos_json TEXT,
  cached_at TEXT,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS techniques_plan_order_idx
  ON techniques (plan_id, sort_order);

CREATE INDEX IF NOT EXISTS mastery_criteria_technique_order_idx
  ON mastery_criteria (technique_id, sort_order);
`;
