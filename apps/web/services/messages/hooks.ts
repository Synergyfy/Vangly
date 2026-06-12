"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageQueries } from "@/lib/api/queries/messages.options";
import { messageKeys } from "@/lib/api/queries/messages.keys";
import { messageMutations } from "@/lib/api/mutations/messages.mutations";
import { walletKeys } from "@/lib/api/queries/wallet.keys";
import { authKeys } from "@/lib/api/queries/auth.keys";

export function useMessageTemplates() {
  return useQuery(messageQueries.templates.list());
}

export function useMessageTemplate(id: string | undefined) {
  return useQuery({
    ...messageQueries.templates.detail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    ...messageMutations.createTemplate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.templates.list() });
    },
  });
}

export function useUpdateMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    ...messageMutations.updateTemplate(),
    onSuccess: (template, vars) => {
      qc.setQueryData(messageKeys.templates.detail(vars.id), template);
      qc.invalidateQueries({ queryKey: messageKeys.templates.list() });
    },
  });
}

export function useDeleteMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    ...messageMutations.deleteTemplate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.templates.list() });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    ...messageMutations.send(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() });
      qc.invalidateQueries({ queryKey: authKeys.me() });
      qc.invalidateQueries({ queryKey: walletKeys.transactions.all() });
    },
  });
}
