"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/api/queries/users.options";
import { userKeys } from "@/lib/api/queries/users.keys";
import { userMutations } from "@/lib/api/mutations/users.mutations";
import type { ListUsersParams } from "@/types/api/users";

export function useUsersList(params: ListUsersParams = {}) {
  return useQuery(userQueries.list(params));
}

export function useUser(id: string | undefined) {
  return useQuery({
    ...userQueries.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    ...userMutations.create(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    ...userMutations.update(),
    onSuccess: (user, vars) => {
      qc.setQueryData(userKeys.detail(vars.id), user);
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    ...userMutations.delete(),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
