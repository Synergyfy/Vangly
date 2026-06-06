"use client";

import { AuthEventsBridge } from "@/components/auth/auth-events-bridge";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthEventsBridge />
      {children}
    </>
  );
}
