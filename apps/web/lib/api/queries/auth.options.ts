import { queryOptions } from "@tanstack/react-query";
import { me as meFn } from "../endpoints/auth";
import { authKeys } from "./auth.keys";

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => meFn(),
      staleTime: 30_000,
    }),
};
