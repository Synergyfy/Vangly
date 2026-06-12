"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyOrganization,
  getMyOrganizationBrand,
  updateMyOrganization,
  updateMyOrganizationBrand,
} from "@/lib/api/endpoints/organizations";
import type {
  UpdateOrganizationBrandInput,
  UpdateOrganizationInput,
} from "@/types/api/organizations";

const ORG_KEYS = {
  me: () => ["organizations", "me"] as const,
  brand: () => ["organizations", "me", "brand"] as const,
};

export function useMyOrganization() {
  return useQuery({
    queryKey: ORG_KEYS.me(),
    queryFn: () => getMyOrganization(),
    staleTime: 30_000,
  });
}

export function useUpdateMyOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateMyOrganization(input),
    onSuccess: (org) => {
      qc.setQueryData(ORG_KEYS.me(), org);
    },
  });
}

export function useMyOrganizationBrand() {
  return useQuery({
    queryKey: ORG_KEYS.brand(),
    queryFn: () => getMyOrganizationBrand(),
    staleTime: 30_000,
  });
}

export function useUpdateMyOrganizationBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationBrandInput) =>
      updateMyOrganizationBrand(input),
    onSuccess: (data) => {
      qc.setQueryData(ORG_KEYS.brand(), data);
    },
  });
}
