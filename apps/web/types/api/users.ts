export type AdminUserRole =
  | "organization_admin"
  | "super_admin"
  | "location_admin"
  | "worker";
export type AdminUserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: AdminUserRole | string;
  organization_id: string;
  team_id?: string;
  branch_id?: string;
  credits: number;
  invites_count: number;
  suspended: boolean;
  created_at: string;
}

export interface CreateUserInput {
  name: string;
  phone: string;
  email?: string;
  role: AdminUserRole;
  team_id?: string;
  branch_id?: string;
  credits?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  team_id?: string;
  branch_id?: string;
  suspended?: boolean;
  credits?: number;
}

export interface ListUsersParams {
  search?: string;
  role?: AdminUserRole;
  team_id?: string;
  branch_id?: string;
  status?: AdminUserStatus;
  page?: number;
  page_size?: number;
}
