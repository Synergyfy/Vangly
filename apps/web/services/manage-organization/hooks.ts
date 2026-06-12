"use client";

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { moQueries } from "@/lib/api/queries/manage-organization.options";
import { moKeys } from "@/lib/api/queries/manage-organization.keys";
import { moMutations } from "@/lib/api/mutations/manage-organization.mutations";
import { deleteMember as deleteMemberFn } from "@/lib/api/endpoints/members";
import {
  getLocationBrand,
  updateLocationBrand,
} from "@/lib/api/endpoints/organizations";
import type { UpdateLocationBrandInput } from "@/types/api/locations";
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

// ── Locations ────────────────────────────────────────────────

export function useLocationsList(params: ListLocationsParams = {}) {
  return useQuery(moQueries.locations.list(params));
}

export function useLocation(id: string | undefined) {
  return useQuery({
    ...moQueries.locations.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useLocationDashboard(
  id: string | undefined,
  params: DashboardQueryParams = {},
) {
  return useQuery({
    ...moQueries.locations.dashboard(id ?? "", params),
    enabled: Boolean(id),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.createLocation(),
    onSuccess: (location) => {
      qc.invalidateQueries({ queryKey: moKeys.locations.lists() });
      qc.setQueryData(moKeys.locations.detail(location.id), location);
    },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.updateLocation(),
    onSuccess: (location, vars) => {
      qc.setQueryData(moKeys.locations.detail(vars.id), location);
      qc.invalidateQueries({ queryKey: moKeys.locations.lists() });
      qc.invalidateQueries({ queryKey: moKeys.locations.dashboards() });
    },
  });
}

export function useArchiveLocation() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.archiveLocation(),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: moKeys.locations.lists() });
      qc.removeQueries({ queryKey: moKeys.locations.detail(id) });
    },
  });
}

export function useSetLocationPhoto() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.setLocationPhoto(),
    onSuccess: (result, vars) => {
      qc.setQueryData(moKeys.locations.detail(vars.id), (prev) =>
        prev ? { ...prev, photo_url: result.photo_url } : prev,
      );
    },
  });
}

export function useLocationBrand(locationId: string | undefined) {
  return useQuery({
    queryKey: ["locations", locationId ?? "", "brand"] as const,
    queryFn: () => getLocationBrand(locationId ?? ""),
    enabled: Boolean(locationId),
    staleTime: 30_000,
  });
}

export function useUpdateLocationBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      locationId: string;
      input: UpdateLocationBrandInput;
    }) => updateLocationBrand(vars.locationId, vars.input),
    onSuccess: (data, vars) => {
      qc.setQueryData(["locations", vars.locationId, "brand"], data);
    },
  });
}

// ── Teams ─────────────────────────────────────────────────────

export function useLocationTeams(
  locationId: string | undefined,
  params: ListTeamsParams = {},
) {
  return useQuery({
    ...moQueries.teams.list(locationId ?? "", params),
    enabled: Boolean(locationId),
  });
}

export function useTeamDetail(
  locationId: string | undefined,
  teamId: string | undefined,
) {
  return useQuery({
    ...moQueries.teams.detail(locationId ?? "", teamId ?? ""),
    enabled: Boolean(locationId) && Boolean(teamId),
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.createTeam(),
    onSuccess: (_team, vars) => {
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(vars.locationId),
      });
    },
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.updateTeam(),
    onSuccess: (team, vars) => {
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(team.location_id),
      });
      qc.invalidateQueries({
        queryKey: moKeys.teams.detail(team.location_id, vars.teamId),
      });
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.deleteTeam(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moKeys.teams.all() });
      qc.invalidateQueries({ queryKey: moKeys.forms.all() });
      qc.invalidateQueries({ queryKey: moKeys.members.all() });
    },
  });
}

export function useCloneTeam() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.cloneTeam(),
    onSuccess: (result) => {
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(result.team.location_id),
      });
    },
  });
}

// ── Members ──────────────────────────────────────────────────

export function useLocationMembers(
  locationId: string | undefined,
  params: ListMembersParams = {},
) {
  return useQuery({
    ...moQueries.members.list(locationId ?? "", params),
    enabled: Boolean(locationId),
  });
}

export function useMember(memberId: string | undefined) {
  return useQuery({
    ...moQueries.members.detail(memberId ?? ""),
    enabled: Boolean(memberId),
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.createMember(),
    onSuccess: (_member, vars) => {
      qc.invalidateQueries({
        queryKey: moKeys.members.byLocation(vars.locationId),
      });
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(vars.locationId),
      });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.updateMember(),
    onSuccess: (member, vars) => {
      qc.setQueryData(moKeys.members.detail(vars.memberId), member);
      qc.invalidateQueries({ queryKey: moKeys.members.all() });
    },
  });
}

export function useTransferMember() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.transferMember(),
    onSuccess: (_member, vars) => {
      qc.invalidateQueries({ queryKey: moKeys.members.all() });
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(vars.input.to_location_id),
      });
      qc.invalidateQueries({
        queryKey: moKeys.members.byLocation(vars.input.to_location_id),
      });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { memberId: string; locationId: string }) =>
      deleteMemberFn(vars.memberId, vars.locationId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: moKeys.members.all() });
      qc.invalidateQueries({
        queryKey: moKeys.members.byLocation(vars.locationId),
      });
      qc.invalidateQueries({
        queryKey: moKeys.teams.byLocation(vars.locationId),
      });
    },
  });
}

export function useStartResetMemberPin() {
  return useMutation(moMutations.startResetMemberPin());
}

export function useVerifyResetMemberPin() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.verifyResetMemberPin(),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: moKeys.members.detail(vars.memberId),
      });
    },
  });
}

// ── Forms ─────────────────────────────────────────────────────

export function useTeamForms(
  teamId: string | undefined,
  params: ListFormsParams = {},
) {
  return useQuery({
    ...moQueries.forms.list(teamId ?? "", params),
    enabled: Boolean(teamId),
  });
}

export function useForm(formId: string | undefined) {
  return useQuery({
    ...moQueries.forms.detail(formId ?? ""),
    enabled: Boolean(formId),
  });
}

export function useFormVersions(formId: string | undefined) {
  return useQuery({
    ...moQueries.forms.versions(formId ?? ""),
    enabled: Boolean(formId),
  });
}

export function useFormResponses(
  formId: string | undefined,
  params: ListFormResponsesParams = {},
) {
  return useQuery({
    ...moQueries.forms.responses(formId ?? "", params),
    enabled: Boolean(formId),
  });
}

export function useFormResponsesInfinite(formId: string | undefined) {
  return useInfiniteQuery({
    ...moQueries.forms.responsesInfinite(formId ?? ""),
    enabled: Boolean(formId),
  });
}

export function useCreateForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.createForm(),
    onSuccess: (form, vars) => {
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(vars.teamId),
      });
      qc.setQueryData(moKeys.forms.detail(form.id), form);
    },
  });
}

export function useUpdateForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.updateForm(),
    onSuccess: (form, vars) => {
      qc.setQueryData(moKeys.forms.detail(vars.formId), form);
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(form.team_id),
      });
    },
  });
}

export function usePublishForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.publishForm(),
    onSuccess: (form, formId) => {
      qc.setQueryData(moKeys.forms.detail(formId), form);
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(form.team_id),
      });
    },
  });
}

export function useArchiveForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.archiveForm(),
    onSuccess: (form, formId) => {
      qc.setQueryData(moKeys.forms.detail(formId), form);
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(form.team_id),
      });
    },
  });
}

export function useDuplicateForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.duplicateForm(),
    onSuccess: (form) => {
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(form.team_id),
      });
      qc.setQueryData(moKeys.forms.detail(form.id), form);
    },
  });
}

export function useCloneForm() {
  const qc = useQueryClient();
  return useMutation({
    ...moMutations.cloneForm(),
    onSuccess: (form) => {
      qc.invalidateQueries({
        queryKey: moKeys.forms.byTeam(form.team_id),
      });
      qc.setQueryData(moKeys.forms.detail(form.id), form);
    },
  });
}

// ── Public form surface ──────────────────────────────────────

export function useTrackPublicScan() {
  return useMutation(moMutations.trackPublicScan());
}

export function useSubmitPublicForm() {
  return useMutation(moMutations.submitPublicForm());
}

// ── Jobs ─────────────────────────────────────────────────────

export function useJob(jobId: string | undefined) {
  return useQuery({
    ...moQueries.jobs.detail(jobId ?? ""),
    enabled: Boolean(jobId),
  });
}
