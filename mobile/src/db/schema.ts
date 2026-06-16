export const DATABASE_NAME = "skillstep.db";
export const DATABASE_VERSION = 4;

export const TABLES = {
  dailySessions: "daily_sessions",
  hobbyProfiles: "hobby_profiles",
  journeys: "journeys",
  practiceCards: "practice_cards",
  projects: "projects",
  sessionReflections: "session_reflections",
  userProfile: "user_profile",
} as const;

export const CREATE_INITIAL_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hobby_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  accent TEXT NOT NULL,
  current_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  preferred_minutes_per_day INTEGER NOT NULL,
  preferred_days_per_week INTEGER NOT NULL,
  preferred_learning_style TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journeys (
  id TEXT PRIMARY KEY NOT NULL,
  hobby_profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  level_from TEXT NOT NULL,
  level_to TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  total_sessions INTEGER NOT NULL,
  current_session_index INTEGER NOT NULL,
  milestones_json TEXT NOT NULL,
  final_project_json TEXT,
  rationale TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (hobby_profile_id) REFERENCES hobby_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  journey_id TEXT NOT NULL,
  hobby_profile_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  scheduled_for TEXT,
  status TEXT NOT NULL,
  learn TEXT NOT NULL,
  resource_json TEXT,
  practice TEXT NOT NULL,
  check_yourself_json TEXT NOT NULL,
  reflection_prompt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
  FOREIGN KEY (hobby_profile_id) REFERENCES hobby_profiles(id) ON DELETE CASCADE,
  UNIQUE (journey_id, day_number)
);

CREATE TABLE IF NOT EXISTS session_reflections (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,
  hobby_profile_id TEXT NOT NULL,
  journey_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  notes TEXT NOT NULL,
  felt_easy TEXT,
  felt_hard TEXT,
  should_revisit INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES daily_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (hobby_profile_id) REFERENCES hobby_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_cards (
  id TEXT PRIMARY KEY NOT NULL,
  hobby_profile_id TEXT NOT NULL,
  journey_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  prompt TEXT,
  answer TEXT,
  difficulty TEXT NOT NULL,
  due_at TEXT NOT NULL,
  last_reviewed_at TEXT,
  review_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (hobby_profile_id) REFERENCES hobby_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES daily_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  hobby_profile_id TEXT NOT NULL,
  journey_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  success_criteria_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (hobby_profile_id) REFERENCES hobby_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS journeys_hobby_status_idx
  ON journeys (hobby_profile_id, status);

CREATE INDEX IF NOT EXISTS daily_sessions_journey_order_idx
  ON daily_sessions (journey_id, day_number);

CREATE INDEX IF NOT EXISTS daily_sessions_hobby_status_idx
  ON daily_sessions (hobby_profile_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS practice_cards_due_idx
  ON practice_cards (due_at, status);

CREATE INDEX IF NOT EXISTS practice_cards_hobby_due_idx
  ON practice_cards (hobby_profile_id, due_at, status);
`;
