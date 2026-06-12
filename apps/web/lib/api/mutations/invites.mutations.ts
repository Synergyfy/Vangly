import { mutationOptions } from "@tanstack/react-query";
import {
  createInvite,
  deleteInvite,
  shareInvite,
  updateInvite,
} from "../endpoints/invites";
import type {
  CreateInviteLinkInput,
  ShareInviteLinkInput,
  UpdateInviteLinkInput,
} from "@/types/api/invites";

export const inviteMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (input: CreateInviteLinkInput) => createInvite(input),
    }),
  update: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateInviteLinkInput }) =>
        updateInvite(vars.id, vars.input),
    }),
  delete: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteInvite(id),
    }),
  share: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: ShareInviteLinkInput }) =>
        shareInvite(vars.id, vars.input),
    }),
};
