import type { FormDistribution, FormField } from "./teams";

export interface PublicFormEntity {
  public_id: string;
  title: string;
  description?: string;
  organization_name: string;
  location_name: string;
  logo_url?: string;
  primary_color?: string;
  fields: FormField[];
  distribution: FormDistribution;
  schema_version: number;
}

export interface TrackScanInput {
  scan_token?: string;
}

export interface PublicScanEntity {
  scan_token: string;
  public_id: string;
  form_id: string;
}

export interface PublicSubmitInput {
  answers: Record<string, unknown>;
  scan_token?: string;
  user_id?: string;
}

export interface PublicSubmitResultEntity {
  response_id: string;
  submitted_at: string;
  message?: string;
}
