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

export interface MessageHistoryItem {
  id: string;
  organization_id: string;
  location_id: string | null;
  to_phone: string;
  template: string;
  body_preview: string;
  status: string;
  credits_after: number;
  at: string;
}

export interface MessageHistoryResult {
  data: MessageHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function listMessageHistory(params: {
  page?: number;
  page_size?: number;
}): Promise<MessageHistoryResult> {
  const { data } = await api.get<MessageHistoryResult>("/api/messages/history", {
    params,
  });
  return data;
}
