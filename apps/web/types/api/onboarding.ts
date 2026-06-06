export interface OnboardingTokenResponse {
  onboarding_token: string;
}

export interface OnboardingStartInput {
  phone: string;
}

export interface OnboardingAccountInput {
  onboarding_token: string;
  organization_name: string;
  admin_name: string;
  pin: string;
}

export interface OnboardingAccountResponse extends OnboardingTokenResponse {
  organization_id: string;
  admin_user_id: string;
}

export interface OnboardingSubdomainInput {
  onboarding_token: string;
  subdomain: string;
}

export interface OnboardingSubdomainResponse extends OnboardingTokenResponse {
  subdomain: string;
  url: string;
}

export interface OnboardingBrandInput {
  onboarding_token: string;
  primary_color: string;
  logo?: File;
}

export interface OnboardingBrandResponse extends OnboardingTokenResponse {
  logo_url: string | null;
  primary_color: string;
}

export interface OnboardingLocationInput {
  onboarding_token: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface OnboardingLocationResponse {
  location_id: string;
  is_hq: boolean;
}

export interface OnboardingCompleteInput {
  onboarding_token: string;
}
