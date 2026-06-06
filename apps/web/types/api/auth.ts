export type UserRole =
  | "super_admin"
  | "organization_admin"
  | "location_admin"
  | "worker";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  organization_id: string | null;
  branch_id: string | null;
  credits: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface LoginInput {
  phone: string;
  pin: string;
  remember?: boolean;
}

export interface ForgotPinInput {
  phone: string;
}

export interface ForgotPinResponse {
  onboarding_token: string;
}

export interface ResetPinInput {
  onboarding_token: string;
  pin: string;
}

export interface ResetPinResponse {
  success: true;
}

export interface RefreshInput {
  refresh_token: string;
}

export interface LogoutInput {
  refresh_token?: string;
  everywhere?: boolean;
}
