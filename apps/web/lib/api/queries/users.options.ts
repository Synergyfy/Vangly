import { queryOptions } from "@tanstack/react-query";
import { getUser, listUsers } from "../endpoints/users";
import type { ListUsersParams } from "@/types/api/users";
import { userKeys } from "./users.keys";

export const userQueries = {
  list: (params: ListUsersParams = {}) =>
    queryOptions({
      queryKey: userKeys.list(params),
      queryFn: () => listUsers(params),
      staleTime: 30_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => getUser(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    }),
};
