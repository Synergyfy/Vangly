export interface OrganizationEntity {
  id: string;
  name: string;
  subdomain: string;
  primary_color?: string | null;
  logo_url?: string | null;
  settings?: Record<string, unknown> | null;
  brand?: Record<string, unknown> | null;
  created_at: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  primary_color?: string;
  logo_url?: string;
}

export interface UpdateOrganizationBrandInput {
  brand: Record<string, unknown>;
}
