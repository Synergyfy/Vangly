"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { trackInviteLink } from "@/lib/api/endpoints/public-forms";
import "@/app/f/first-timer.css";

export default function InviteRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveInvite() {
      try {
        const result = await trackInviteLink(code);
        if (result && result.form_public_id) {
          const query = new URLSearchParams();
          if (result.owner_user_id) {
            query.set("worker_id", result.owner_user_id);
          }
          if (result.owner_name) {
            query.set("worker_name", result.owner_name);
          }
          if (result.location_id) {
            query.set("location_id", result.location_id);
          }
          router.replace(`/f/${result.form_public_id}?${query.toString()}`);
        } else {
          setError("This invite link is not connected to a form.");
        }
      } catch (err) {
        console.error("Failed to track invite link:", err);
        setError("Invalid or expired invite link.");
      }
    }

    if (code) {
      void resolveInvite();
    }
  }, [code, router]);

  if (error) {
    return (
      <div className="first-timer-container">
        <div className="first-timer-card glass" style={{ textAlign: "center", padding: "40px 24px" }}>
          <AlertTriangle size={48} className="text-danger" style={{ display: "inline-block", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Invite Code Error</h2>
          <p style={{ color: "var(--text-tertiary)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="first-timer-container">
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-tertiary)" }}>
        <Loader2 size={36} className="spinner" style={{ display: "inline-block", marginBottom: "16px" }} />
        <p style={{ fontSize: "16px", fontWeight: 500 }}>Connecting you to organization...</p>
      </div>
    </div>
  );
}
