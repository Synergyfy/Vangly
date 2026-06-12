import { queryOptions } from "@tanstack/react-query";
import { getWalletBalance, listWalletTransactions } from "../endpoints/wallet";
import type { ListWalletTransactionsParams } from "@/types/api/wallet";
import { walletKeys } from "./wallet.keys";

export const walletQueries = {
  balance: () =>
    queryOptions({
      queryKey: walletKeys.balance(),
      queryFn: () => getWalletBalance(),
      staleTime: 15_000,
    }),
  transactions: (params: ListWalletTransactionsParams = {}) =>
    queryOptions({
      queryKey: walletKeys.transactions.list(params),
      queryFn: () => listWalletTransactions(params),
      staleTime: 30_000,
    }),
};
