import { api } from "../client";
import type {
  CreateLocationInput,
  DashboardQueryParams,
  ListLocationsParams,
  Location,
  LocationDashboardEntity,
  LocationPhotoInput,
  UpdateLocationInput,
} from "@/types/api/locations";
import type { PaginatedResponse } from "@/types/api/teams";

export async function listLocations(
  params: ListLocationsParams = {},
): Promise<PaginatedResponse<Location>> {
  const { data } = await api.get<PaginatedResponse<Location>>("/api/locations", {
    params,
  });
  return data;
}

export async function getLocation(id: string): Promise<Location> {
  const { data } = await api.get<Location>(`/api/locations/${id}`);
  return data;
}

export async function createLocation(input: CreateLocationInput): Promise<Location> {
  const { data } = await api.post<Location>("/api/locations", input);
  return data;
}

export async function updateLocation(
  id: string,
  input: UpdateLocationInput,
): Promise<Location> {
  const { data } = await api.patch<Location>(`/api/locations/${id}`, input);
  return data;
}

export async function archiveLocation(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/locations/${id}`);
  return data;
}

export async function setLocationPhoto(
  id: string,
  input: LocationPhotoInput,
): Promise<{ photo_url: string }> {
  const { data } = await api.post<{ photo_url: string }>(
    `/api/locations/${id}/photo`,
    input,
  );
  return data;
}

export async function getLocationDashboard(
  id: string,
  params: DashboardQueryParams = {},
): Promise<LocationDashboardEntity> {
  const { data } = await api.get<LocationDashboardEntity>(
    `/api/locations/${id}/dashboard`,
    { params },
  );
  return data;
}
