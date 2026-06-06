"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/lib/api/queries/auth.options";
import { authMutations } from "@/lib/api/mutations/auth.mutations";
import { authKeys } from "@/lib/api/queries/auth.keys";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import type { LoginInput, LogoutInput, User } from "@/types/api/auth";

export function useMe() {
  const hasToken = typeof window !== "undefined" && getAccessToken() !== null;

  return useQuery({
    ...authQueries.me(),
    enabled: hasToken,
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    ...authMutations.login(),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      qc.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authMutations.logout().mutationFn,
    onSettled: () => {
      clearTokens();
      qc.setQueryData(authKeys.me(), null);
      qc.removeQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useForgotPin() {
  return useMutation(authMutations.forgotPin());
}

export function useResetPin() {
  return useMutation(authMutations.resetPin());
}

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  login: (input: LoginInput) => Promise<User>;
  logout: (options?: { everywhere?: boolean }) => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const meQuery = useMe();
  const loginMut = useLogin();
  const logoutMut = useLogout();

  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      const result = await loginMut.mutateAsync(input);
      return result.user;
    },
    [loginMut],
  );

  const logout = useCallback(
    async (options?: { everywhere?: boolean }): Promise<void> => {
      const refreshToken = getRefreshToken();
      const payload: LogoutInput = refreshToken
        ? { refresh_token: refreshToken, everywhere: options?.everywhere }
        : { everywhere: options?.everywhere };

      try {
        await logoutMut.mutateAsync(payload);
      } catch {
        // The interceptor already cleared local state on auth:logout.
        // Swallow network errors so the user is logged out client-side regardless.
      }
    },
    [logoutMut],
  );

  return {
    user: meQuery.data ?? null,
    isAuthenticated: Boolean(meQuery.data),
    isLoading: meQuery.isLoading,
    error: (meQuery.error as ApiError | null) ?? null,
    login,
    logout,
  };
}
