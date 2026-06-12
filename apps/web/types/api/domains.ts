export type CustomDomainStatus =
  | "pending"
  | "verifying"
  | "active"
  | "failed";
export type CustomDomainSslStatus = "none" | "active";

export interface CustomDomain {
  id: string;
  organization_id: string;
  domain: string;
  status: CustomDomainStatus;
  verification_token: string;
  verified_at?: string;
  ssl_status: CustomDomainSslStatus;
  dns_instructions?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomDomainInput {
  domain: string;
}

export interface UpdateCustomDomainInput {
  note?: string;
  ssl_status?: "none" | "provisioning" | "active" | "failed";
}
