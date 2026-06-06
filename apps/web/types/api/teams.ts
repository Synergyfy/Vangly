import type { Location, TeamPreviewMember } from "./locations";

export type TeamKind = "admin" | "operational" | "outreach" | "custom";

export interface Team {
  id: string;
  organization_id: string;
  location_id: string;
  name: string;
  description?: string;
  kind: TeamKind;
  is_public_joinable: boolean;
  allow_member_pin: boolean;
  sms_otp_required: boolean;
  member_count: number;
  form_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  is_public_joinable?: boolean;
  allow_member_pin?: boolean;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  is_public_joinable?: boolean;
  allow_member_pin?: boolean;
}

export interface ListTeamsParams {
  q?: string;
  team_id?: string;
  kind?: TeamKind;
  page?: number;
  per_page?: number;
}

export interface CloneTeamInput {
  source_location_id: string;
  source_team_name: string;
  import_members?: boolean;
  import_forms?: boolean;
}

export interface CloneTeamResult {
  team: Team;
  imported_members: number;
  imported_forms: number;
}

export type MemberStatus = "active" | "inactive" | "suspended";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: MemberStatus;
  roles: string[];
  team_admins: string[];
  invites_count: number;
  created_at: string;
}

export interface TeamDetailMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: MemberStatus;
  roles: string[];
  team_admins: string[];
  invites_count: number;
  is_team_admin: boolean;
  created_at: string;
}

export interface TeamDetailForm {
  id: string;
  public_id: string;
  title: string;
  status: FormStatus;
  field_count: number;
  scans: number;
  submissions: number;
  updated_at: string;
}

export interface TeamDetailEntity {
  team: Team;
  members: TeamDetailMember[];
  forms: TeamDetailForm[];
  meta: PaginationMeta;
}

export interface CreateMemberInput {
  name: string;
  phone: string;
  email?: string;
  pin?: string;
  team_ids: string[];
  status?: MemberStatus;
  is_team_admin?: string[];
  assign_forms?: string[];
}

export interface UpdateMemberInput {
  name?: string;
  phone?: string;
  email?: string;
  status?: MemberStatus;
  is_team_admin?: string[];
  pin?: string;
}

export interface TransferMemberInput {
  to_location_id: string;
  to_team_ids: string[];
  is_team_admin?: string[];
}

export interface ListMembersParams {
  q?: string;
  team_id?: string;
  status?: MemberStatus;
  page?: number;
  per_page?: number;
}

export interface BulkImportRow {
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

export interface BulkImportInput {
  team_id: string;
  default_status?: "active" | "inactive";
  rows: BulkImportRow[];
}

export interface BulkImportResponse {
  job_id: string;
  queued: number;
}

export type FormStatus = "draft" | "published" | "archived";
export type FormFieldType =
  | "text"
  | "multiline"
  | "number"
  | "email"
  | "phone"
  | "rating"
  | "single_choice"
  | "multi_choice"
  | "dropdown"
  | "date"
  | "signature"
  | "photo"
  | "barcode"
  | "address";

export type FormDistributionMode = "public" | "registered" | "private";
export type FormDistributionFrequency = "all" | "one_per_user" | "unlimited";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FormField {
  key: string;
  label: string;
  type?: FormFieldType;
  required?: boolean;
  placeholder?: string;
  help_text?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  meta?: Record<string, unknown>;
}

export interface FormDistribution {
  mode?: FormDistributionMode;
  frequency?: FormDistributionFrequency;
  open_at?: string;
  close_at?: string;
  send_sms_invites?: boolean;
  sms_message?: string;
}

export interface FormEntity {
  id: string;
  public_id: string;
  title: string;
  description?: string;
  status: FormStatus;
  fields: FormField[];
  distribution: FormDistribution;
  schema_version: number;
  analytics_scans: number;
  analytics_submissions: number;
  team_id: string;
  location_id: string;
  created_at: string;
  published_at?: string;
  updated_at: string;
  public_url: string;
  qr_payload: string;
}

export interface CreateFormInput {
  title: string;
  description?: string;
  fields: FormField[];
  distribution?: FormDistribution;
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  fields?: FormField[];
  distribution?: FormDistribution;
}

export interface ListFormsParams {
  team_id?: string;
  status?: FormStatus;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface CloneFormInput {
  target_team_id: string;
  new_title?: string;
}

export interface FormVersion {
  id: string;
  form_id: string;
  schema_version: number;
  archived_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  form_schema_version: number;
  submitted_at: string;
  submitted_by?: string;
  answers: Record<string, unknown>;
}

export interface ListFormResponsesParams {
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface JobError {
  row: number;
  message: string;
}

export interface JobView {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: JobError[];
  kind: "members_bulk_import";
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export type { Location, TeamPreviewMember };
