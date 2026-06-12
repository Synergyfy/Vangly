import { api } from "../client";
import type {
  CreateCustomDomainInput,
  CustomDomain,
  UpdateCustomDomainInput,
} from "@/types/api/domains";

export async function listDomains(): Promise<CustomDomain[]> {
  const { data } = await api.get<CustomDomain[]>("/api/domains");
  return data;
}

export async function getDomain(id: string): Promise<CustomDomain> {
  const { data } = await api.get<CustomDomain>(`/api/domains/${id}`);
  return data;
}

export async function createDomain(
  input: CreateCustomDomainInput,
): Promise<CustomDomain> {
  const { data } = await api.post<CustomDomain>("/api/domains", input);
  return data;
}

export async function verifyDomain(id: string): Promise<CustomDomain> {
  const { data } = await api.post<CustomDomain>(
    `/api/domains/${id}/verify`,
  );
  return data;
}

export async function updateDomain(
  id: string,
  input: UpdateCustomDomainInput,
): Promise<CustomDomain> {
  const { data } = await api.patch<CustomDomain>(`/api/domains/${id}`, input);
  return data;
}

export async function deleteDomain(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/domains/${id}`);
  return data;
}
