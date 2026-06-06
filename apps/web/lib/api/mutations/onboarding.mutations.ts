import { mutationOptions } from "@tanstack/react-query";
import {
  claimSubdomain as claimSubdomainFn,
  completeOnboarding as completeOnboardingFn,
  createAccount as createAccountFn,
  createLocation as createLocationFn,
  startOnboarding as startOnboardingFn,
  uploadBrand as uploadBrandFn,
} from "../endpoints/onboarding";
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

export const onboardingMutations = {
  start: () =>
    mutationOptions<OnboardingTokenResponse, Error, OnboardingStartInput>({
      mutationFn: (input) => startOnboardingFn(input),
    }),
  account: () =>
    mutationOptions<OnboardingAccountResponse, Error, OnboardingAccountInput>({
      mutationFn: (input) => createAccountFn(input),
    }),
  subdomain: () =>
    mutationOptions<OnboardingSubdomainResponse, Error, OnboardingSubdomainInput>({
      mutationFn: (input) => claimSubdomainFn(input),
    }),
  brand: () =>
    mutationOptions<OnboardingBrandResponse, Error, OnboardingBrandInput>({
      mutationFn: (input) => uploadBrandFn(input),
    }),
  location: () =>
    mutationOptions<OnboardingLocationResponse, Error, OnboardingLocationInput>({
      mutationFn: (input) => createLocationFn(input),
    }),
  complete: () =>
    mutationOptions<AuthResponse, Error, OnboardingCompleteInput>({
      mutationFn: (input) => completeOnboardingFn(input),
    }),
};
