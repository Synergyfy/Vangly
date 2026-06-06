"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/api/queries/auth.keys";

export function AuthEventsBridge() {
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    const handler = () => {
      qc.setQueryData(authKeys.me(), null);
      qc.removeQueries({ queryKey: authKeys.me() });
      router.push("/login");
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [qc, router]);

  return null;
}
