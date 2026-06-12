"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactQueries } from "@/lib/api/queries/contacts.options";
import { contactKeys } from "@/lib/api/queries/contacts.keys";
import { contactMutations } from "@/lib/api/mutations/contacts.mutations";
import type { ListContactsParams } from "@/types/api/contacts";

export function useContactsList(params: ListContactsParams = {}) {
  return useQuery(contactQueries.list(params));
}

export function useContact(id: string | undefined) {
  return useQuery({
    ...contactQueries.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    ...contactMutations.create(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    ...contactMutations.update(),
    onSuccess: (contact, vars) => {
      qc.setQueryData(contactKeys.detail(vars.id), contact);
      qc.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    ...contactMutations.delete(),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: contactKeys.detail(id) });
      qc.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
}

export function useBulkCreateContacts() {
  const qc = useQueryClient();
  return useMutation({
    ...contactMutations.bulkCreate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
}
