"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/lib/api/queries/auth.options";
import { authMutations } from "@/lib/api/mutations/auth.mutations";
import { authKeys } from "@/lib/api/queries/auth.keys";
import { ApiError } from "@/lib/api/client";
import type { LoginInput, User } from "@/types/api/auth";

export function useMe() {
  // With httpOnly cookies the browser always sends the access cookie automatically.
  // We no longer gate on a localStorage token — the query simply runs; if the
  // cookie is absent or expired the API returns 401 which the Axios interceptor
  // handles by attempting a silent refresh before the query error surfaces.
  return useQuery({
    ...authQueries.me(),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    ...authMutations.login(),
    onSuccess: (data) => {
      // The API has already set the httpOnly access + refresh cookies.
      // We only need to warm the React Query cache with the user object.
      qc.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authMutations.logout().mutationFn,
    onSettled: () => {
      // The API has already cleared the cookies via Set-Cookie.
      // We just need to wipe the client-side cache.
      qc.setQueryData(authKeys.me(), null);
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
    async (): Promise<void> => {
      try {
        // POST /api/auth/logout — the refresh cookie is sent automatically.
        await logoutMut.mutateAsync(undefined);
      } catch {
        // Swallow network errors: the cache is cleared in onSettled regardless.
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
