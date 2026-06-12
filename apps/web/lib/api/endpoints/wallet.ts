import { api } from "../client";
import type {
  ListWalletTransactionsParams,
  PurchaseSmsInput,
  TopupWalletInput,
  WalletBalance,
  WalletLedger,
} from "@/types/api/wallet";

export async function getWalletBalance(): Promise<WalletBalance> {
  const { data } = await api.get<WalletBalance>("/api/wallet/balance");
  return data;
}

export async function listWalletTransactions(
  params: ListWalletTransactionsParams = {},
): Promise<WalletLedger> {
  const { data } = await api.get<WalletLedger>("/api/wallet/transactions", {
    params,
  });
  return data;
}

export async function topupWallet(input: TopupWalletInput): Promise<WalletBalance> {
  const { data } = await api.post<WalletBalance>("/api/wallet/topup", input);
  return data;
}

export async function purchaseSms(input: PurchaseSmsInput): Promise<WalletBalance> {
  const { data } = await api.post<WalletBalance>(
    "/api/wallet/sms-purchase",
    input,
  );
  return data;
}
