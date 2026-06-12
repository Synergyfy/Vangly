import { queryOptions } from "@tanstack/react-query";
import {
  getInvite,
  getMyInvite,
  listInvites,
} from "../endpoints/invites";
import type { ListInvitesParams } from "@/types/api/invites";
import { inviteKeys } from "./invites.keys";

export const inviteQueries = {
  list: (params: ListInvitesParams = {}) =>
    queryOptions({
      queryKey: inviteKeys.list(params),
      queryFn: () => listInvites(params),
      staleTime: 30_000,
    }),
  mine: () =>
    queryOptions({
      queryKey: inviteKeys.mine(),
      queryFn: () => getMyInvite(),
      staleTime: 30_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: inviteKeys.detail(id),
      queryFn: () => getInvite(id),
      enabled: Boolean(id),
      staleTime: 30_000,
    }),
};
