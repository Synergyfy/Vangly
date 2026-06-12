import { queryOptions } from "@tanstack/react-query";
import {
  getMessageTemplate,
  listMessageTemplates,
} from "../endpoints/messages";
import { messageKeys } from "./messages.keys";

export const messageQueries = {
  templates: {
    list: () =>
      queryOptions({
        queryKey: messageKeys.templates.list(),
        queryFn: () => listMessageTemplates(),
        staleTime: 60_000,
      }),
    detail: (id: string) =>
      queryOptions({
        queryKey: messageKeys.templates.detail(id),
        queryFn: () => getMessageTemplate(id),
        enabled: Boolean(id),
        staleTime: 60_000,
      }),
  },
};
