import type { ListInvitesParams } from "@/types/api/invites";

export const inviteKeys = {
  all: ["invites"] as const,
  lists: () => [...inviteKeys.all, "list"] as const,
  list: (params: ListInvitesParams) =>
    [...inviteKeys.lists(), params] as const,
  mine: () => [...inviteKeys.all, "me"] as const,
  details: () => [...inviteKeys.all, "detail"] as const,
  detail: (id: string) => [...inviteKeys.details(), id] as const,
};
