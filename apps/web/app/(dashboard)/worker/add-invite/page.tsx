"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useAuth } from "@/services/auth";
import { useCreateInvite } from "@/services/invites";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";
import "./add-invite.css";

export default function AddInvitePage() {
  const router = useRouter();
  const { user } = useAuth();
  const createInvite = useCreateInvite();

  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState("");

  const { errors, setError, clearAll } = useFieldErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

    if (!user?.id) {
      toast.error("Could not identify your account. Please sign in again.");
      return;
    }
    let hasError = false;
    if (!Number.isFinite(maxUses) || maxUses < 1) {
      setError("max_uses", "Must be at least 1 use.");
      hasError = true;
    }
    if (maxUses > 10000) {
      setError("max_uses", "Max uses is limited to 10,000.");
      hasError = true;
    }
    if (!Number.isFinite(expiryDays) || expiryDays < 1) {
      setError("expiry", "Expiry must be at least 1 day.");
      hasError = true;
    }
    if (expiryDays > 365) {
      setError("expiry", "Expiry is limited to 365 days.");
      hasError = true;
    }
    if (hasError) return;

    const expires_at = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    try {
      const result = await createInvite.mutateAsync({
        max_uses: maxUses,
        expires_at,
      });
      setCreatedCode(result.code);
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create invite link."));
    }
  };

  return (
    <div className="add-invite-page">
      <div className="page-header flex-between">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: "0.5rem", borderRadius: "50%" }}
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1>Create New Invite</h1>
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Generate a reusable link to share with newcomers.
            </p>
          </div>
        </div>
      </div>

      <div className="form-container">
        <Card className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-body">
              <Input
                label="Max Uses"
                type="number"
                min={1}
                max={10000}
                value={String(maxUses)}
                onChange={(e) =>
                  setMaxUses(
                    e.target.value === "" ? 1 : parseInt(e.target.value, 10),
                  )
                }
                error={errors.max_uses}
                required
                autoFocus
              />

              <Input
                label="Expires In (Days)"
                type="number"
                min={1}
                max={365}
                value={String(expiryDays)}
                onChange={(e) =>
                  setExpiryDays(
                    e.target.value === "" ? 1 : parseInt(e.target.value, 10),
                  )
                }
                error={errors.expiry}
                required
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createInvite.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvite.isPending}
                className="btn-premium"
              >
                {createInvite.isPending ? (
                  <Loader2
                    size={16}
                    className="spinner"
                    style={{ marginRight: "8px" }}
                  />
                ) : (
                  <UserPlus size={16} style={{ marginRight: "8px" }} />
                )}
                Create Invite Link
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="check"
        title="Invite Link Created"
        description={
          createdCode
            ? `Your new invite code is ${createdCode}. Share it with people you'd like to invite.`
            : "Your new invite link is ready to share."
        }
        primaryAction={{
          label: "Go to My Invites",
          navigateTo: "/worker/invites",
        }}
      />
    </div>
  );
}
