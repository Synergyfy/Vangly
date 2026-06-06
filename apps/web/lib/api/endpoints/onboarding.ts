import { api } from "../client";
import type {
  OnboardingAccountInput,
  OnboardingAccountResponse,
  OnboardingBrandInput,
  OnboardingBrandResponse,
  OnboardingCompleteInput,
  OnboardingLocationInput,
  OnboardingLocationResponse,
  OnboardingStartInput,
  OnboardingSubdomainInput,
  OnboardingSubdomainResponse,
  OnboardingTokenResponse,
} from "@/types/api/onboarding";
import type { AuthResponse } from "@/types/api/auth";

export async function startOnboarding(
  input: OnboardingStartInput,
): Promise<OnboardingTokenResponse> {
  const { data } = await api.post<OnboardingTokenResponse>(
    "/api/auth/onboarding/start",
    input,
  );
  return data;
}

export async function createAccount(
  input: OnboardingAccountInput,
): Promise<OnboardingAccountResponse> {
  const { data } = await api.post<OnboardingAccountResponse>(
    "/api/auth/onboarding/account",
    input,
  );
  return data;
}

export async function claimSubdomain(
  input: OnboardingSubdomainInput,
): Promise<OnboardingSubdomainResponse> {
  const { data } = await api.post<OnboardingSubdomainResponse>(
    "/api/auth/onboarding/subdomain",
    input,
  );
  return data;
}

export async function uploadBrand(
  input: OnboardingBrandInput,
): Promise<OnboardingBrandResponse> {
  const form = new FormData();
  form.append("onboarding_token", input.onboarding_token);
  form.append("primary_color", input.primary_color);
  if (input.logo) {
    form.append("logo", input.logo);
  }
  const { data } = await api.post<OnboardingBrandResponse>(
    "/api/auth/onboarding/brand",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function createLocation(
  input: OnboardingLocationInput,
): Promise<OnboardingLocationResponse> {
  const { data } = await api.post<OnboardingLocationResponse>(
    "/api/auth/onboarding/location",
    input,
  );
  return data;
}

export async function completeOnboarding(
  input: OnboardingCompleteInput,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/api/auth/onboarding/complete",
    input,
  );
  return data;
}
