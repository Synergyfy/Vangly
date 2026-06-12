export type TemplateMode = "strict" | "flexible" | "open";
export type TemplateChannel = "sms";
export type TemplateScope = "organization" | "location";

export interface MessageTemplate {
  id: string;
  organization_id: string;
  scope: TemplateScope;
  location_id?: string;
  name: string;
  channel: TemplateChannel;
  body: string;
  variables?: Record<string, string>;
  mode: TemplateMode;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageTemplateInput {
  name: string;
  body: string;
  mode?: TemplateMode;
  channel?: TemplateChannel;
  scope?: TemplateScope;
  location_id?: string;
  variables?: Record<string, string>;
}

export interface UpdateMessageTemplateInput {
  name?: string;
  body?: string;
  mode?: TemplateMode;
  scope?: TemplateScope;
  location_id?: string;
  variables?: Record<string, string>;
}

export interface SendMessageRecipient {
  phone: string;
  contact_id?: string;
  name?: string;
}

export interface SendMessageInput {
  template_id?: string;
  body?: string;
  variables?: Record<string, string>;
  recipients: SendMessageRecipient[];
  contact_id?: string;
}

export interface SendMessageResultItem {
  phone: string;
  ok: boolean;
  error?: string;
}

export interface SendMessageResult {
  total: number;
  sent: number;
  failed: number;
  results: SendMessageResultItem[];
}
