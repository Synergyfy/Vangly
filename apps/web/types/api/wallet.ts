export type WalletOwnerType = "user" | "location";

export interface WalletBalance {
  owner_type: WalletOwnerType;
  owner_id?: string;
  balance: number;
  currency: string;
}

export type WalletTxnKind =
  | "topup"
  | "purchase_sms"
  | "send_sms"
  | "refund"
  | "promo";

export interface WalletTransaction {
  id: string;
  organization_id: string;
  owner_type: string;
  owner_user_id?: string;
  owner_location_id?: string;
  delta: number;
  balance_after: number;
  kind: string;
  ref_id?: string;
  location_id?: string;
  actor_user_id?: string;
  description?: string;
  created_at: string;
}

export interface WalletLedger {
  data: WalletTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TopupWalletInput {
  amount: number;
  ref_id?: string;
  description?: string;
  owner_type: WalletOwnerType;
  location_id?: string;
}

export interface PurchaseSmsInput {
  sms_count: number;
  location_id: string;
  description?: string;
}

export interface ListWalletTransactionsParams {
  page?: number;
  page_size?: number;
}
