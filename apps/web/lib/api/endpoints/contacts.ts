import { api } from "../client";
import type {
  BulkCreateContactInput,
  BulkCreateContactResult,
  Contact,
  CreateContactInput,
  ListContactsParams,
  UpdateContactInput,
} from "@/types/api/contacts";

export async function listContacts(
  params: ListContactsParams = {},
): Promise<Contact[]> {
  const { data } = await api.get<Contact[]>("/api/contacts", { params });
  return data;
}

export async function getContact(id: string): Promise<Contact> {
  const { data } = await api.get<Contact>(`/api/contacts/${id}`);
  return data;
}

export async function createContact(input: CreateContactInput): Promise<Contact> {
  const { data } = await api.post<Contact>("/api/contacts", input);
  return data;
}

export async function updateContact(
  id: string,
  input: UpdateContactInput,
): Promise<Contact> {
  const { data } = await api.patch<Contact>(`/api/contacts/${id}`, input);
  return data;
}

export async function deleteContact(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/contacts/${id}`);
  return data;
}

export async function bulkCreateContacts(
  input: BulkCreateContactInput,
): Promise<BulkCreateContactResult> {
  const { data } = await api.post<BulkCreateContactResult>(
    "/api/contacts/bulk",
    input,
  );
  return data;
}
