import { api } from "../client";
import type {
  CreateInviteLinkInput,
  InviteLink,
  ListInvitesParams,
  ShareInviteLinkInput,
  ShareInviteLinkResult,
  UpdateInviteLinkInput,
} from "@/types/api/invites";

export async function listInvites(
  params: ListInvitesParams = {},
): Promise<InviteLink[]> {
  const { data } = await api.get<unknown>("/api/invites", { params });
  return Array.isArray(data)
    ? (data as InviteLink[])
    : ((data as { data?: InviteLink[] })?.data ?? []);
}

export async function getMyInvite(): Promise<InviteLink> {
  const { data } = await api.get<InviteLink>("/api/invites/me");
  return data;
}

export async function getInvite(id: string): Promise<InviteLink> {
  const { data } = await api.get<InviteLink>(`/api/invites/${id}`);
  return data;
}

export async function createInvite(input: CreateInviteLinkInput): Promise<InviteLink> {
  const { data } = await api.post<InviteLink>("/api/invites", input);
  return data;
}

export async function updateInvite(
  id: string,
  input: UpdateInviteLinkInput,
): Promise<InviteLink> {
  const { data } = await api.patch<InviteLink>(`/api/invites/${id}`, input);
  return data;
}

export async function deleteInvite(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/invites/${id}`);
  return data;
}

export async function shareInvite(
  id: string,
  input: ShareInviteLinkInput,
): Promise<ShareInviteLinkResult> {
  const { data } = await api.post<ShareInviteLinkResult>(
    `/api/invites/${id}/share`,
    input,
  );
  return data;
}
