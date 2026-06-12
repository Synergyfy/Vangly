"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { domainQueries } from "@/lib/api/queries/domains.options";
import { domainKeys } from "@/lib/api/queries/domains.keys";
import { domainMutations } from "@/lib/api/mutations/domains.mutations";

export function useDomainsList() {
  return useQuery(domainQueries.list());
}

export function useDomain(id: string | undefined) {
  return useQuery({
    ...domainQueries.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    ...domainMutations.create(),
    onSuccess: (domain) => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
      qc.setQueryData(domainKeys.detail(domain.id), domain);
    },
  });
}

export function useVerifyDomain() {
  const qc = useQueryClient();
  return useMutation({
    ...domainMutations.verify(),
    onSuccess: (domain, id) => {
      qc.setQueryData(domainKeys.detail(id), domain);
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}

export function useUpdateDomain() {
  const qc = useQueryClient();
  return useMutation({
    ...domainMutations.update(),
    onSuccess: (domain, vars) => {
      qc.setQueryData(domainKeys.detail(vars.id), domain);
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    ...domainMutations.delete(),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: domainKeys.detail(id) });
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}
