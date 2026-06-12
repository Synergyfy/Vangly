export type UserRole =
  | 'super_admin'
  | 'organization_admin'
  | 'location_admin'
  | 'branch_admin' // legacy alias for location_admin
  | 'worker'
  | null;

export interface AuthUserDto {
  id: string;
  name: string;
  role: UserRole;
  organization_id: string | null;
  branch_id: string | null;
  credits: number;
}

export interface OnboardingStartRequest {
  phone: string;
}

export interface OnboardingAccountRequest {
  onboarding_token: string;
  organization_name: string;
  admin_name: string;
  pin: string;
}

export interface OnboardingSubdomainRequest {
  onboarding_token: string;
  subdomain: string;
}

export interface OnboardingBrandRequest {
  onboarding_token: string;
  primary_color: string;
}

export interface OnboardingLocationRequest {
  onboarding_token: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface OnboardingCompleteRequest {
  onboarding_token: string;
}

export interface LoginRequest {
  phone: string;
  pin: string;
  remember?: boolean;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token?: string;
  everywhere?: boolean;
}

export interface ForgotPinRequest {
  phone: string;
}

export interface ResetPinRequest {
  phone: string;
  otp: string;
  pin: string;
}
