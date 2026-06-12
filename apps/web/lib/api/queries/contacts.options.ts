import { queryOptions } from "@tanstack/react-query";
import {
  getContact,
  listContacts,
} from "../endpoints/contacts";
import type { ListContactsParams } from "@/types/api/contacts";
import { contactKeys } from "./contacts.keys";

export const contactQueries = {
  list: (params: ListContactsParams = {}) =>
    queryOptions({
      queryKey: contactKeys.list(params),
      queryFn: () => listContacts(params),
      staleTime: 30_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: contactKeys.detail(id),
      queryFn: () => getContact(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    }),
};
