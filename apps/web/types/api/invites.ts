export type InviteLinkStatus = "active" | "revoked";
export type InviteShareChannel = "sms" | "email" | "qr";

export interface InviteLink {
  id: string;
  organization_id: string;
  location_id?: string;
  team_id?: string;
  owner_user_id: string;
  form_id?: string;
  code: string;
  expires_at?: string;
  max_uses: number;
  uses: number;
  status: InviteLinkStatus;
  url: string;
  qr_payload: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInviteLinkInput {
  team_id?: string;
  form_id?: string;
  max_uses?: number;
  expires_at?: string;
}

export interface UpdateInviteLinkInput {
  status?: InviteLinkStatus;
  max_uses?: number;
  expires_at?: string;
}

export interface ShareInviteLinkInput {
  channel: InviteShareChannel;
  recipient: string;
}

export interface ShareInviteLinkResult {
  ok: boolean;
  channel: InviteShareChannel;
  recipient: string;
}

export interface ListInvitesParams {
  page?: number;
  page_size?: number;
}
