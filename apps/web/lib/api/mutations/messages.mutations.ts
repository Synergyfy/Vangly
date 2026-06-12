import { mutationOptions } from "@tanstack/react-query";
import {
  createMessageTemplate,
  deleteMessageTemplate,
  sendMessage,
  updateMessageTemplate,
} from "../endpoints/messages";
import type {
  CreateMessageTemplateInput,
  SendMessageInput,
  UpdateMessageTemplateInput,
} from "@/types/api/messages";

export const messageMutations = {
  createTemplate: () =>
    mutationOptions({
      mutationFn: (input: CreateMessageTemplateInput) =>
        createMessageTemplate(input),
    }),
  updateTemplate: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateMessageTemplateInput }) =>
        updateMessageTemplate(vars.id, vars.input),
    }),
  deleteTemplate: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteMessageTemplate(id),
    }),
  send: () =>
    mutationOptions({
      mutationFn: (input: SendMessageInput) => sendMessage(input),
    }),
};
