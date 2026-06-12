"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteQueries } from "@/lib/api/queries/invites.options";
import { inviteKeys } from "@/lib/api/queries/invites.keys";
import { inviteMutations } from "@/lib/api/mutations/invites.mutations";
import type { ListInvitesParams } from "@/types/api/invites";

export function useInvitesList(params: ListInvitesParams = {}) {
  return useQuery(inviteQueries.list(params));
}

export function useMyInvite() {
  return useQuery(inviteQueries.mine());
}

export function useInvite(id: string | undefined) {
  return useQuery({
    ...inviteQueries.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    ...inviteMutations.create(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inviteKeys.lists() });
      qc.invalidateQueries({ queryKey: inviteKeys.mine() });
    },
  });
}

export function useUpdateInvite() {
  const qc = useQueryClient();
  return useMutation({
    ...inviteMutations.update(),
    onSuccess: (invite, vars) => {
      qc.setQueryData(inviteKeys.detail(vars.id), invite);
      qc.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

export function useDeleteInvite() {
  const qc = useQueryClient();
  return useMutation({
    ...inviteMutations.delete(),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: inviteKeys.detail(id) });
      qc.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

export function useShareInvite() {
  return useMutation(inviteMutations.share());
}
