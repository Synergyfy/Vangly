import { queryOptions } from "@tanstack/react-query";
import { getDomain, listDomains } from "../endpoints/domains";
import { domainKeys } from "./domains.keys";

export const domainQueries = {
  list: () =>
    queryOptions({
      queryKey: domainKeys.list(),
      queryFn: () => listDomains(),
      staleTime: 30_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: domainKeys.detail(id),
      queryFn: () => getDomain(id),
      enabled: Boolean(id),
      staleTime: 15_000,
    }),
};
