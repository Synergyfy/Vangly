import { api } from "../client";
import type { OrganizationEntity } from "@/types/api/organizations";
import type { LocationBrand } from "@/types/api/locations";

export async function getMyOrganization(): Promise<OrganizationEntity> {
  const { data } = await api.get<OrganizationEntity>("/api/organizations/me");
  return data;
}

export async function updateMyOrganization(input: {
  name?: string;
  primary_color?: string;
  logo_url?: string | null;
}): Promise<OrganizationEntity> {
  const { data } = await api.patch<OrganizationEntity>(
    "/api/organizations/me",
    input,
  );
  return data;
}

export async function getMyOrganizationBrand(): Promise<{ brand: Record<string, unknown> }> {
  const { data } = await api.get<{ brand: Record<string, unknown> }>(
    "/api/organizations/me/brand",
  );
  return data;
}

export async function updateMyOrganizationBrand(input: {
  brand: Record<string, unknown>;
}): Promise<{ brand: Record<string, unknown> }> {
  const { data } = await api.patch<{ brand: Record<string, unknown> }>(
    "/api/organizations/me/brand",
    input,
  );
  return data;
}

export async function getLocationBrand(locationId: string): Promise<LocationBrand> {
  const { data } = await api.get<LocationBrand>(
    `/api/locations/${locationId}/brand`,
  );
  return data;
}

export async function updateLocationBrand(
  locationId: string,
  input: { brand: Record<string, unknown> },
): Promise<LocationBrand> {
  const { data } = await api.patch<LocationBrand>(
    `/api/locations/${locationId}/brand`,
    input,
  );
  return data;
}
