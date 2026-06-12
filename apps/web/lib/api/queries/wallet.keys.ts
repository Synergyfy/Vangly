import type { ListWalletTransactionsParams } from "@/types/api/wallet";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
  transactions: {
    all: () => [...walletKeys.all, "transactions"] as const,
    list: (params: ListWalletTransactionsParams) =>
      [...walletKeys.transactions.all(), params] as const,
  },
};
