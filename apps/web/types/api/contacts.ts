export type ContactStatus = "invited" | "attended" | "lost";

export interface Contact {
  id: string;
  organization_id: string;
  location_id?: string;
  owner_user_id?: string;
  source_user_id?: string;
  name: string;
  phone: string;
  email?: string;
  note?: string;
  status: ContactStatus | string;
  source_kind: string;
  last_messaged_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  name: string;
  phone: string;
  email?: string;
  note?: string;
  team_id?: string;
}

export interface UpdateContactInput {
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  status?: ContactStatus;
}

export interface BulkCreateContactInput {
  contacts: CreateContactInput[];
}

export interface BulkCreateContactResult {
  created: number;
  skipped: number;
}

export interface ListContactsParams {
  status?: ContactStatus;
  search?: string;
  team_id?: string;
  owner_user_id?: string;
  page?: number;
  page_size?: number;
}
