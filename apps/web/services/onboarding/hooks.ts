"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingMutations } from "@/lib/api/mutations/onboarding.mutations";
import { authKeys } from "@/lib/api/queries/auth.keys";
import { setTokens } from "@/lib/api/auth-token";

export function useOnboardingStart() {
  return useMutation(onboardingMutations.start());
}

export function useOnboardingAccount() {
  return useMutation(onboardingMutations.account());
}

export function useOnboardingSubdomain() {
  return useMutation(onboardingMutations.subdomain());
}

export function useOnboardingBrand() {
  return useMutation(onboardingMutations.brand());
}

export function useOnboardingLocation() {
  return useMutation(onboardingMutations.location());
}

export function useOnboardingComplete() {
  const qc = useQueryClient();

  return useMutation({
    ...onboardingMutations.complete(),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      qc.setQueryData(authKeys.me(), data.user);
    },
  });
}
