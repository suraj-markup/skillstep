import {
  type Project,
  ProjectSchema,
  type ProjectStatus,
  ProjectStatusSchema,
} from "@skillstep/shared";

import { runDatabaseOperation } from "./database";
import { TABLES } from "./schema";

type ProjectRow = {
  completed_at: string | null;
  created_at: string;
  description: string;
  hobby_profile_id: string;
  id: string;
  journey_id: string;
  status: string;
  success_criteria_json: string;
  title: string;
};

export async function getProjectsForJourney(journeyId: string): Promise<Project[]> {
  return runDatabaseOperation(async (database) => {
    const rows = await database.getAllAsync<ProjectRow>(
      `
      SELECT *
      FROM ${TABLES.projects}
      WHERE journey_id = ?
      ORDER BY datetime(created_at) ASC;
      `,
      [journeyId],
    );

    return rows.map(mapProjectRow);
  });
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
  const validStatus = ProjectStatusSchema.parse(status);
  const completedAt = validStatus === "completed" ? new Date().toISOString() : null;

  await runDatabaseOperation(async (database) => {
    await database.runAsync(
      `
      UPDATE ${TABLES.projects}
      SET status = ?,
          completed_at = ?
      WHERE id = ?;
      `,
      [validStatus, completedAt, projectId],
    );
  });
}

function mapProjectRow(row: ProjectRow): Project {
  return ProjectSchema.parse({
    id: row.id,
    hobbyProfileId: row.hobby_profile_id,
    journeyId: row.journey_id,
    title: row.title,
    description: row.description,
    successCriteria: JSON.parse(row.success_criteria_json),
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  });
}
