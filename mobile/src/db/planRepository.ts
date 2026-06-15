import {
  type Plan,
  PlanSchema,
  type TechniqueContent,
  TechniqueContentSchema,
  type TechniqueStatus,
  TechniqueStatusSchema,
  type TechniqueUserState,
} from "@skillstep/shared";
import type { SQLiteDatabase } from "expo-sqlite";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type PlanRow = {
  id: string;
  hobby: string;
  level_from: string;
  level_to: string;
  weekly_hours: number;
  rationale: string;
  icon: string;
  accent: string;
  created_at: string;
};

type TechniqueRow = {
  id: string;
  name: string;
  why_it_matters: string;
  modality_video: string;
  modality_reading: string;
  modality_practice: string;
  drill_text: string;
  minutes_per_session: number;
  sessions_per_week: number;
};

type MasteryCriterionRow = {
  id: string;
  technique_id: string;
  text: string;
};

type TechniqueStateRow = {
  technique_id: string;
  status: TechniqueStatus;
};

type CheckedCriterionRow = {
  technique_id: string;
  criterion_id: string;
};

type CheckedAtRow = {
  checked_at: string | null;
};

type TechniqueContentRow = {
  cached_at: string | null;
  primer: string | null;
  videos_json: string | null;
};

export async function savePlan(plan: Plan): Promise<void> {
  const validPlan = PlanSchema.parse(plan);

  await runDatabaseOperation(async (database) => {
    await database.withTransactionAsync(async () => {
      await writePlan(database, validPlan);
    });
  });
}

export async function saveCurrentPlanForHobby(plan: Plan): Promise<void> {
  const validPlan = PlanSchema.parse(plan);

  await runDatabaseOperation(async (database) => {
    await database.withTransactionAsync(async () => {
      const planRows = await database.getAllAsync<Pick<PlanRow, "id" | "hobby">>(
        `
        SELECT id, hobby
        FROM ${TABLES.plans}
        WHERE id != ?;
        `,
        [validPlan.id],
      );
      const currentHobbyKey = normalizeHobbyKey(validPlan.hobby);
      const stalePlanIds = planRows
        .filter((planRow) => normalizeHobbyKey(planRow.hobby) === currentHobbyKey)
        .map((planRow) => planRow.id);

      if (stalePlanIds.length > 0) {
        await database.runAsync(
          `
          DELETE FROM ${TABLES.plans}
          WHERE id IN (${createPlaceholders(stalePlanIds.length)});
          `,
          stalePlanIds,
        );
      }

      await writePlan(database, validPlan);
    });
  });
}

async function writePlan(database: SQLiteDatabase, validPlan: Plan): Promise<void> {
  const now = new Date().toISOString();
  const techniqueIds = validPlan.techniques.map((technique) => technique.id);

  await database.runAsync(
    `
    INSERT INTO ${TABLES.plans} (
      id,
      hobby,
      level_from,
      level_to,
      weekly_hours,
      rationale,
      icon,
      accent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      hobby = excluded.hobby,
      level_from = excluded.level_from,
      level_to = excluded.level_to,
      weekly_hours = excluded.weekly_hours,
      rationale = excluded.rationale,
      icon = excluded.icon,
      accent = excluded.accent,
      created_at = excluded.created_at;
    `,
    [
      validPlan.id,
      validPlan.hobby,
      validPlan.levelFrom,
      validPlan.levelTo,
      validPlan.weeklyHours,
      validPlan.rationale,
      validPlan.icon,
      validPlan.accent,
      validPlan.createdAt,
    ],
  );

  await database.runAsync(
    `
    DELETE FROM ${TABLES.techniques}
    WHERE plan_id = ?
      AND id NOT IN (${createPlaceholders(techniqueIds.length)});
    `,
    [validPlan.id, ...techniqueIds],
  );

  for (const [techniqueIndex, technique] of validPlan.techniques.entries()) {
    await database.runAsync(
      `
      INSERT INTO ${TABLES.techniques} (
        id,
        plan_id,
        name,
        why_it_matters,
        modality_video,
        modality_reading,
        modality_practice,
        drill_text,
        minutes_per_session,
        sessions_per_week,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        plan_id = excluded.plan_id,
        name = excluded.name,
        why_it_matters = excluded.why_it_matters,
        modality_video = excluded.modality_video,
        modality_reading = excluded.modality_reading,
        modality_practice = excluded.modality_practice,
        drill_text = excluded.drill_text,
        minutes_per_session = excluded.minutes_per_session,
        sessions_per_week = excluded.sessions_per_week,
        sort_order = excluded.sort_order;
      `,
      [
        technique.id,
        validPlan.id,
        technique.name,
        technique.whyItMatters,
        technique.modalityProfile.video,
        technique.modalityProfile.reading,
        technique.modalityProfile.practice,
        technique.drill.text,
        technique.drill.minutesPerSession,
        technique.drill.sessionsPerWeek,
        techniqueIndex,
      ],
    );

    await database.runAsync(
      `
      INSERT OR IGNORE INTO ${TABLES.techniqueStates} (
        technique_id,
        status,
        updated_at
      )
      VALUES (?, ?, ?);
      `,
      [technique.id, "todo", now],
    );

    const criterionIds = technique.masteryCriteria.map((criterion) => criterion.id);

    await database.runAsync(
      `
      DELETE FROM ${TABLES.masteryCriteria}
      WHERE technique_id = ?
        AND id NOT IN (${createPlaceholders(criterionIds.length)});
      `,
      [technique.id, ...criterionIds],
    );

    for (const [criterionIndex, criterion] of technique.masteryCriteria.entries()) {
      await database.runAsync(
        `
        INSERT INTO ${TABLES.masteryCriteria} (
          id,
          technique_id,
          text,
          sort_order
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          technique_id = excluded.technique_id,
          text = excluded.text,
          sort_order = excluded.sort_order;
        `,
        [criterion.id, technique.id, criterion.text, criterionIndex],
      );
    }
  }
}

export async function getPlans(): Promise<Plan[]> {
  return runDatabaseOperation(async (database) => {
    const planRows = await database.getAllAsync<PlanRow>(
      `
      SELECT *
      FROM ${TABLES.plans}
      ORDER BY datetime(created_at) DESC;
      `,
    );

    const plans: Plan[] = [];

    for (const planRow of planRows) {
      const plan = await readPlanById(database, planRow.id);
      if (plan) plans.push(plan);
    }

    return plans;
  });
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  return runDatabaseOperation((database) => readPlanById(database, planId));
}

async function readPlanById(database: SQLiteDatabase, planId: string): Promise<Plan | null> {
  const planRow = await database.getFirstAsync<PlanRow>(
    `
    SELECT *
    FROM ${TABLES.plans}
    WHERE id = ?;
    `,
    [planId],
  );

  if (!planRow) {
    return null;
  }

  const techniqueRows = await database.getAllAsync<TechniqueRow>(
    `
    SELECT
      id,
      name,
      why_it_matters,
      modality_video,
      modality_reading,
      modality_practice,
      drill_text,
      minutes_per_session,
      sessions_per_week
    FROM ${TABLES.techniques}
    WHERE plan_id = ?
    ORDER BY sort_order ASC;
    `,
    [planId],
  );

  const criterionRows = await database.getAllAsync<MasteryCriterionRow>(
    `
    SELECT
      id,
      technique_id,
      text
    FROM ${TABLES.masteryCriteria}
    WHERE technique_id IN (
      SELECT id
      FROM ${TABLES.techniques}
      WHERE plan_id = ?
    )
    ORDER BY technique_id ASC, sort_order ASC;
    `,
    [planId],
  );

  const criteriaByTechniqueId = groupCriteriaByTechniqueId(criterionRows);

  return PlanSchema.parse({
    id: planRow.id,
    hobby: planRow.hobby,
    levelFrom: planRow.level_from,
    levelTo: planRow.level_to,
    weeklyHours: planRow.weekly_hours,
    rationale: planRow.rationale,
    icon: planRow.icon,
    accent: planRow.accent,
    createdAt: planRow.created_at,
    techniques: techniqueRows.map((techniqueRow) => ({
      id: techniqueRow.id,
      name: techniqueRow.name,
      whyItMatters: techniqueRow.why_it_matters,
      modalityProfile: {
        video: techniqueRow.modality_video,
        reading: techniqueRow.modality_reading,
        practice: techniqueRow.modality_practice,
      },
      drill: {
        text: techniqueRow.drill_text,
        minutesPerSession: techniqueRow.minutes_per_session,
        sessionsPerWeek: techniqueRow.sessions_per_week,
      },
      masteryCriteria: criteriaByTechniqueId[techniqueRow.id] ?? [],
    })),
  });
}

export async function updateTechniqueStatus(
  techniqueId: string,
  status: TechniqueStatus,
): Promise<void> {
  const validStatus = TechniqueStatusSchema.parse(status);

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      INSERT INTO ${TABLES.techniqueStates} (
        technique_id,
        status,
        updated_at
      )
      VALUES (?, ?, ?)
      ON CONFLICT(technique_id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at;
      `,
      [techniqueId, validStatus, new Date().toISOString()],
    );
  });
}

export async function getTechniqueContent(techniqueId: string): Promise<TechniqueContent | null> {
  return runDatabaseOperation(async (database) => {
    const row = await database.getFirstAsync<TechniqueContentRow>(
      `
      SELECT primer, videos_json, cached_at
      FROM ${TABLES.techniqueContent}
      WHERE technique_id = ?;
      `,
      [techniqueId],
    );

    if (!row) {
      return null;
    }

    return TechniqueContentSchema.parse({
      primer: row.primer ?? undefined,
      videos: row.videos_json ? JSON.parse(row.videos_json) : undefined,
    });
  });
}

export async function saveTechniqueContent(
  techniqueId: string,
  content: TechniqueContent,
): Promise<void> {
  const validContent = TechniqueContentSchema.parse(content);

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      INSERT INTO ${TABLES.techniqueContent} (
        technique_id,
        primer,
        videos_json,
        cached_at
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(technique_id) DO UPDATE SET
        primer = excluded.primer,
        videos_json = excluded.videos_json,
        cached_at = excluded.cached_at;
      `,
      [
        techniqueId,
        validContent.primer ?? null,
        JSON.stringify(validContent.videos ?? []),
        new Date().toISOString(),
      ],
    );
  });
}

function createPlaceholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(", ");
}

function normalizeHobbyKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function toggleMasteryCriterion(criterionId: string): Promise<boolean> {
  return runDatabaseOperation(async (database) => {
    let isChecked = false;

    await database.withTransactionAsync(async () => {
      const row = await database.getFirstAsync<CheckedAtRow>(
        `
        SELECT checked_at
        FROM ${TABLES.masteryCriteria}
        WHERE id = ?;
        `,
        [criterionId],
      );

      if (!row) {
        throw new Error(`Mastery criterion not found: ${criterionId}`);
      }

      isChecked = row.checked_at === null;

      await database.runAsync(
        `
        UPDATE ${TABLES.masteryCriteria}
        SET checked_at = ?
        WHERE id = ?;
        `,
        [isChecked ? new Date().toISOString() : null, criterionId],
      );
    });

    return isChecked;
  });
}

export async function getTechniqueUserStates(
  planId: string,
): Promise<Record<string, TechniqueUserState>> {
  return runDatabaseOperation(async (database) => {
    const stateRows = await database.getAllAsync<TechniqueStateRow>(
      `
      SELECT
        states.technique_id,
        states.status
      FROM ${TABLES.techniqueStates} states
      INNER JOIN ${TABLES.techniques} techniques
        ON techniques.id = states.technique_id
      WHERE techniques.plan_id = ?;
      `,
      [planId],
    );

    const checkedCriterionRows = await database.getAllAsync<CheckedCriterionRow>(
      `
      SELECT
        criteria.technique_id,
        criteria.id AS criterion_id
      FROM ${TABLES.masteryCriteria} criteria
      INNER JOIN ${TABLES.techniques} techniques
        ON techniques.id = criteria.technique_id
      WHERE techniques.plan_id = ?
        AND criteria.checked_at IS NOT NULL;
      `,
      [planId],
    );

    const checkedCriteriaByTechniqueId = checkedCriterionRows.reduce<Record<string, string[]>>(
      (checkedCriteria, row) => {
        checkedCriteria[row.technique_id] ??= [];
        checkedCriteria[row.technique_id].push(row.criterion_id);
        return checkedCriteria;
      },
      {},
    );

    return stateRows.reduce<Record<string, TechniqueUserState>>((states, row) => {
      states[row.technique_id] = {
        status: TechniqueStatusSchema.parse(row.status),
        checkedCriteria: checkedCriteriaByTechniqueId[row.technique_id] ?? [],
      };
      return states;
    }, {});
  });
}

function groupCriteriaByTechniqueId(
  criterionRows: MasteryCriterionRow[],
): Record<string, Plan["techniques"][number]["masteryCriteria"]> {
  return criterionRows.reduce<Record<string, Plan["techniques"][number]["masteryCriteria"]>>(
    (criteriaByTechniqueId, criterionRow) => {
      criteriaByTechniqueId[criterionRow.technique_id] ??= [];
      criteriaByTechniqueId[criterionRow.technique_id].push({
        id: criterionRow.id,
        text: criterionRow.text,
      });
      return criteriaByTechniqueId;
    },
    {},
  );
}
