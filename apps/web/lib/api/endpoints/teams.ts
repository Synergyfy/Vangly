import { api } from "../client";
import type {
  CloneTeamInput,
  CloneTeamResult,
  CreateTeamInput,
  ListTeamsParams,
  PaginatedResponse,
  Team,
  TeamDetailEntity,
  UpdateTeamInput,
} from "@/types/api/teams";

export async function listLocationTeams(
  locationId: string,
  params: ListTeamsParams = {},
): Promise<PaginatedResponse<Team>> {
  const { data } = await api.get<PaginatedResponse<Team>>(
    `/api/locations/${locationId}/teams`,
    { params },
  );
  return data;
}

export async function getTeamDetail(
  locationId: string,
  teamId: string,
  params: { q?: string; page?: number; per_page?: number } = {},
): Promise<TeamDetailEntity> {
  const { data } = await api.get<TeamDetailEntity>(
    `/api/locations/${locationId}/teams/${teamId}`,
    { params },
  );
  return data;
}

export async function createTeam(
  locationId: string,
  input: CreateTeamInput,
): Promise<Team> {
  const { data } = await api.post<Team>(
    `/api/locations/${locationId}/teams`,
    input,
  );
  return data;
}

export async function updateTeam(
  teamId: string,
  input: UpdateTeamInput,
): Promise<Team> {
  const { data } = await api.patch<Team>(`/api/teams/${teamId}`, input);
  return data;
}

export async function deleteTeam(teamId: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/teams/${teamId}`);
  return data;
}

export async function cloneTeam(
  teamId: string,
  input: CloneTeamInput,
): Promise<CloneTeamResult> {
  const { data } = await api.post<CloneTeamResult>(
    `/api/teams/${teamId}/clone-from`,
    input,
  );
  return data;
}
