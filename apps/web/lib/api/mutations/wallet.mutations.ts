import { mutationOptions } from "@tanstack/react-query";
import {
  purchaseSms,
  topupWallet,
} from "../endpoints/wallet";
import type { PurchaseSmsInput, TopupWalletInput } from "@/types/api/wallet";

export const walletMutations = {
  topup: () =>
    mutationOptions({
      mutationFn: (input: TopupWalletInput) => topupWallet(input),
    }),
  purchaseSms: () =>
    mutationOptions({
      mutationFn: (input: PurchaseSmsInput) => purchaseSms(input),
    }),
};
