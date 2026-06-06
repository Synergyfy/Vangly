import type {
  DashboardQueryParams,
  ListLocationsParams,
} from "@/types/api/locations";
import type {
  ListFormResponsesParams,
  ListFormsParams,
  ListMembersParams,
  ListTeamsParams,
} from "@/types/api/teams";

export const moKeys = {
  all: ["manage-organization"] as const,

  locations: {
    all: () => [...moKeys.all, "locations"] as const,
    lists: () => [...moKeys.locations.all(), "list"] as const,
    list: (params: ListLocationsParams) =>
      [...moKeys.locations.lists(), params] as const,
    details: () => [...moKeys.locations.all(), "detail"] as const,
    detail: (id: string) => [...moKeys.locations.details(), id] as const,
    dashboards: () => [...moKeys.locations.all(), "dashboard"] as const,
    dashboard: (id: string, params: DashboardQueryParams) =>
      [...moKeys.locations.dashboards(), id, params] as const,
  },

  teams: {
    all: () => [...moKeys.all, "teams"] as const,
    byLocation: (locationId: string) =>
      [...moKeys.teams.all(), "by-location", locationId] as const,
    list: (locationId: string, params: ListTeamsParams) =>
      [...moKeys.teams.byLocation(locationId), "list", params] as const,
    detail: (locationId: string, teamId: string) =>
      [...moKeys.teams.byLocation(locationId), "detail", teamId] as const,
  },

  members: {
    all: () => [...moKeys.all, "members"] as const,
    byLocation: (locationId: string) =>
      [...moKeys.members.all(), "by-location", locationId] as const,
    list: (locationId: string, params: ListMembersParams) =>
      [...moKeys.members.byLocation(locationId), "list", params] as const,
    details: () => [...moKeys.members.all(), "detail"] as const,
    detail: (memberId: string) =>
      [...moKeys.members.details(), memberId] as const,
  },

  forms: {
    all: () => [...moKeys.all, "forms"] as const,
    byTeam: (teamId: string) =>
      [...moKeys.forms.all(), "by-team", teamId] as const,
    list: (teamId: string, params: ListFormsParams) =>
      [...moKeys.forms.byTeam(teamId), "list", params] as const,
    details: () => [...moKeys.forms.all(), "detail"] as const,
    detail: (formId: string) =>
      [...moKeys.forms.details(), formId] as const,
    versions: (formId: string) =>
      [...moKeys.forms.detail(formId), "versions"] as const,
    responses: (formId: string, params: ListFormResponsesParams) =>
      [...moKeys.forms.detail(formId), "responses", params] as const,
  },

  jobs: {
    all: () => [...moKeys.all, "jobs"] as const,
    detail: (jobId: string) => [...moKeys.jobs.all(), jobId] as const,
  },
};
