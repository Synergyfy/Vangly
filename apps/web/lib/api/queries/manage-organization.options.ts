import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import {
  getForm,
  getJob,
  getLocation,
  getLocationDashboard,
  getMember,
  getTeamDetail,
  listFormResponses,
  listFormVersions,
  listLocationMembers,
  listLocationTeams,
  listLocations,
  listTeamForms,
} from "../endpoints";
import { moKeys } from "./manage-organization.keys";

export const moQueries = {
  locations: {
    list: (params: Parameters<typeof listLocations>[0]) =>
      queryOptions({
        queryKey: moKeys.locations.list(params ?? {}),
        queryFn: () => listLocations(params ?? {}),
        staleTime: 30_000,
      }),
    detail: (id: string) =>
      queryOptions({
        queryKey: moKeys.locations.detail(id),
        queryFn: () => getLocation(id),
        enabled: Boolean(id),
        staleTime: 60_000,
      }),
    dashboard: (id: string, params: Parameters<typeof getLocationDashboard>[1]) =>
      queryOptions({
        queryKey: moKeys.locations.dashboard(id, params ?? {}),
        queryFn: () => getLocationDashboard(id, params ?? {}),
        enabled: Boolean(id),
        staleTime: 30_000,
      }),
  },

  teams: {
    list: (locationId: string, params: Parameters<typeof listLocationTeams>[1]) =>
      queryOptions({
        queryKey: moKeys.teams.list(locationId, params ?? {}),
        queryFn: () => listLocationTeams(locationId, params ?? {}),
        enabled: Boolean(locationId),
        staleTime: 30_000,
      }),
    detail: (locationId: string, teamId: string) =>
      queryOptions({
        queryKey: moKeys.teams.detail(locationId, teamId),
        queryFn: () => getTeamDetail(locationId, teamId),
        enabled: Boolean(locationId) && Boolean(teamId),
        staleTime: 30_000,
      }),
  },

  members: {
    list: (locationId: string, params: Parameters<typeof listLocationMembers>[1]) =>
      queryOptions({
        queryKey: moKeys.members.list(locationId, params ?? {}),
        queryFn: () => listLocationMembers(locationId, params ?? {}),
        enabled: Boolean(locationId),
        staleTime: 30_000,
      }),
    detail: (memberId: string) =>
      queryOptions({
        queryKey: moKeys.members.detail(memberId),
        queryFn: () => getMember(memberId),
        enabled: Boolean(memberId),
        staleTime: 30_000,
      }),
  },

  forms: {
    list: (teamId: string, params: Parameters<typeof listTeamForms>[1]) =>
      queryOptions({
        queryKey: moKeys.forms.list(teamId, params ?? {}),
        queryFn: () => listTeamForms(teamId, params ?? {}),
        enabled: Boolean(teamId),
        staleTime: 30_000,
      }),
    detail: (formId: string) =>
      queryOptions({
        queryKey: moKeys.forms.detail(formId),
        queryFn: () => getForm(formId),
        enabled: Boolean(formId),
        staleTime: 30_000,
      }),
    versions: (formId: string) =>
      queryOptions({
        queryKey: moKeys.forms.versions(formId),
        queryFn: () => listFormVersions(formId),
        enabled: Boolean(formId),
        staleTime: 60_000,
      }),
    responses: (formId: string, params: Parameters<typeof listFormResponses>[1]) =>
      queryOptions({
        queryKey: moKeys.forms.responses(formId, params ?? {}),
        queryFn: () => listFormResponses(formId, params ?? {}),
        enabled: Boolean(formId),
        staleTime: 30_000,
      }),
    responsesInfinite: (formId: string) =>
      infiniteQueryOptions({
        queryKey: [...moKeys.forms.detail(formId), "responses", "infinite"],
        queryFn: ({ pageParam = 1 }) =>
          listFormResponses(formId, { page: pageParam, per_page: 50 }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
          last.meta.page * last.meta.per_page < last.meta.total
            ? last.meta.page + 1
            : undefined,
        enabled: Boolean(formId),
        staleTime: 30_000,
      }),
  },

  jobs: {
    detail: (jobId: string) =>
      queryOptions({
        queryKey: moKeys.jobs.detail(jobId),
        queryFn: () => getJob(jobId),
        enabled: Boolean(jobId),
        refetchInterval: (query) => {
          const status = query.state.data?.status;
          return status === "done" || status === "failed" ? false : 1_000;
        },
        staleTime: 0,
      }),
  },
};
