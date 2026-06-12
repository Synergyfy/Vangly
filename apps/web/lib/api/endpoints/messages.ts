import { api } from "../client";
import type {
  CreateMessageTemplateInput,
  MessageTemplate,
  SendMessageInput,
  SendMessageResult,
  UpdateMessageTemplateInput,
} from "@/types/api/messages";

export async function listMessageTemplates(): Promise<MessageTemplate[]> {
  const { data } = await api.get<MessageTemplate[]>(
    "/api/messages/templates",
  );
  return data;
}

export async function getMessageTemplate(id: string): Promise<MessageTemplate> {
  const { data } = await api.get<MessageTemplate>(
    `/api/messages/templates/${id}`,
  );
  return data;
}

export async function createMessageTemplate(
  input: CreateMessageTemplateInput,
): Promise<MessageTemplate> {
  const { data } = await api.post<MessageTemplate>(
    "/api/messages/templates",
    input,
  );
  return data;
}

export async function updateMessageTemplate(
  id: string,
  input: UpdateMessageTemplateInput,
): Promise<MessageTemplate> {
  const { data } = await api.patch<MessageTemplate>(
    `/api/messages/templates/${id}`,
    input,
  );
  return data;
}

export async function deleteMessageTemplate(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(
    `/api/messages/templates/${id}`,
  );
  return data;
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const { data } = await api.post<SendMessageResult>(
    "/api/messages/send",
    input,
  );
  return data;
}
