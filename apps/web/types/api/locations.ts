import type { TeamKind } from "./teams";

export type LocationStatus = "active" | "paused" | "archived";
export type ActivityLevel = "High" | "Medium" | "Low";

export interface LocationStats {
  teams: number;
  members: number;
  submissions_30d: number;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  description?: string;
  photo_url?: string;
  is_hq: boolean;
  status: LocationStatus;
  activity: ActivityLevel;
  stats: LocationStats;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationInput {
  name: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  description?: string;
  photo_url?: string;
}

export interface UpdateLocationInput {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  description?: string;
  photo_url?: string;
  status?: LocationStatus;
}

export interface ListLocationsParams {
  q?: string;
  status?: LocationStatus;
  page?: number;
  per_page?: number;
}

export interface LocationPhotoInput {
  photo_url: string;
}

export type DashboardTab = "performance" | "teams" | "settings";
export type DashboardTimeframe = "week" | "month" | "year";

export interface DashboardQueryParams {
  tab?: DashboardTab;
  timeframe?: DashboardTimeframe;
}

export interface DashboardStat {
  label: string;
  value: number | string;
  meta?: string;
  change_pct?: number;
  is_up: boolean;
}

export interface AttendanceBucket {
  label: string;
  value: number;
}

export interface Milestone {
  label: string;
  value: string;
  date: string;
  icon: "calendar" | "users" | "target";
}

export interface PerformanceTabData {
  stats: DashboardStat[];
  attendance: {
    timeframe: DashboardTimeframe;
    buckets: AttendanceBucket[];
  };
  milestones: Milestone[];
}

export interface TeamPreviewMember {
  id: string;
  name: string;
}

export interface TeamsTabTeam {
  id: string;
  name: string;
  description?: string;
  kind: TeamKind;
  is_public_joinable: boolean;
  allow_member_pin: boolean;
  sms_otp_required: boolean;
  member_count: number;
  form_count: number;
  preview_members: TeamPreviewMember[];
}

export interface TeamsTabData {
  teams: TeamsTabTeam[];
}

export interface SettingsTabData {
  status: LocationStatus;
  primary_admin?: { id: string; name: string } | null;
  security_protocol: string;
  created_at: string;
}

export interface LocationDashboardEntity {
  tab: DashboardTab;
  data: PerformanceTabData | TeamsTabData | SettingsTabData;
}
