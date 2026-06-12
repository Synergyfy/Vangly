"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletQueries } from "@/lib/api/queries/wallet.options";
import { walletKeys } from "@/lib/api/queries/wallet.keys";
import { walletMutations } from "@/lib/api/mutations/wallet.mutations";
import { authKeys } from "@/lib/api/queries/auth.keys";
import type { ListWalletTransactionsParams } from "@/types/api/wallet";

export function useWalletBalance() {
  return useQuery(walletQueries.balance());
}

export function useWalletTransactions(params: ListWalletTransactionsParams = {}) {
  return useQuery(walletQueries.transactions(params));
}

export function useTopupWallet() {
  const qc = useQueryClient();
  return useMutation({
    ...walletMutations.topup(),
    onSuccess: (balance) => {
      qc.setQueryData(walletKeys.balance(), balance);
      qc.invalidateQueries({ queryKey: walletKeys.transactions.all() });
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function usePurchaseSms() {
  const qc = useQueryClient();
  return useMutation({
    ...walletMutations.purchaseSms(),
    onSuccess: (balance) => {
      qc.setQueryData(walletKeys.balance(), balance);
      qc.invalidateQueries({ queryKey: walletKeys.transactions.all() });
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
