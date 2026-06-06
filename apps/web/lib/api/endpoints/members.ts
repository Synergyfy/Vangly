import { api } from "../client";
import type {
  BulkImportInput,
  BulkImportResponse,
  CreateMemberInput,
  ListMembersParams,
  Member,
  PaginatedResponse,
  TransferMemberInput,
  UpdateMemberInput,
} from "@/types/api/teams";

export async function listLocationMembers(
  locationId: string,
  params: ListMembersParams = {},
): Promise<PaginatedResponse<Member>> {
  const { data } = await api.get<PaginatedResponse<Member>>(
    `/api/locations/${locationId}/members`,
    { params },
  );
  return data;
}

export async function createMember(
  locationId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const { data } = await api.post<Member>(
    `/api/locations/${locationId}/members`,
    input,
  );
  return data;
}

export async function getMember(memberId: string): Promise<Member> {
  const { data } = await api.get<Member>(`/api/members/${memberId}`);
  return data;
}

export async function updateMember(
  memberId: string,
  input: UpdateMemberInput,
): Promise<Member> {
  const { data } = await api.patch<Member>(`/api/members/${memberId}`, input);
  return data;
}

export async function deleteMember(
  memberId: string,
  locationId: string,
): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/members/${memberId}`, {
    params: { location_id: locationId },
  });
  return data;
}

export async function transferMember(
  memberId: string,
  input: TransferMemberInput,
): Promise<Member> {
  const { data } = await api.post<Member>(
    `/api/members/${memberId}/transfer`,
    input,
  );
  return data;
}

export async function startResetMemberPin(
  memberId: string,
): Promise<{ otp_expires_in: number }> {
  const { data } = await api.post<{ otp_expires_in: number }>(
    `/api/members/${memberId}/reset-pin`,
  );
  return data;
}

export async function verifyResetMemberPin(
  memberId: string,
  input: { otp: string; pin: string },
): Promise<{ ok: true }> {
  const { data } = await api.post<{ ok: true }>(
    `/api/members/${memberId}/reset-pin/verify`,
    input,
  );
  return data;
}

export async function bulkImportMembers(
  locationId: string,
  input: BulkImportInput,
): Promise<BulkImportResponse> {
  const { data } = await api.post<BulkImportResponse>(
    `/api/locations/${locationId}/members/bulk-import`,
    input,
  );
  return data;
}

export function exportMembersUrl(locationId: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/api/locations/${locationId}/members/export`;
}
