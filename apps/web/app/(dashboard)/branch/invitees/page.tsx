"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Share2,
  UserPlus,
  ArrowLeft,
  Loader2,
  Trash2,
  Power,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import {
  useCreateInvite,
  useDeleteInvite,
  useInvitesList,
  useShareInvite,
  useUpdateInvite,
} from "@/services/invites";
import { useAuth } from "@/services/auth";
import "./invitees.css";

export default function BranchInviteesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const invitesQuery = useInvitesList();
  const createInvite = useCreateInvite();
  const updateInvite = useUpdateInvite();
  const deleteInvite = useDeleteInvite();
  const shareInvite = useShareInvite();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shareFor, setShareFor] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("100");
  const [shareChannel, setShareChannel] = useState<"sms" | "email">("sms");
  const [shareRecipient, setShareRecipient] = useState("");

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = createInvite.isPending || shareInvite.isPending;

  const invites = (invitesQuery.data ?? []).filter(
    (i) => !branchId || i.location_id === branchId,
  );

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not copy link."));
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "revoked" : "active";
    try {
      await updateInvite.mutateAsync({ id, input: { status: next } });
      toast.success(`Invite link ${next}.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update invite link."));
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete invite link "${code}"?`)) return;
    try {
      await deleteInvite.mutateAsync(id);
      toast.success("Invite link deleted.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete invite link."));
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewMaxUses("100");
    clearAll();
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setTimeout(resetForm, 250);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();
    if (!newName.trim()) {
      setError("name", "Name is required.");
      return;
    }
    const max = Number(newMaxUses);
    if (!Number.isInteger(max) || max < 1) {
      setError("maxUses", "Max uses must be a positive number.");
      return;
    }
    try {
      await createInvite.mutateAsync({ max_uses: max });
      toast.success(`Invite link "${newName.trim()}" created.`);
      setShowSuccess(true);
      handleCloseCreate();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create invite link."));
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareFor) return;
    clearAll();
    if (!shareRecipient.trim()) {
      setError("recipient", "Recipient is required.");
      return;
    }
    try {
      await shareInvite.mutateAsync({
        id: shareFor.id,
        input: { channel: shareChannel, recipient: shareRecipient.trim() },
      });
      toast.success(`Invite shared via ${shareChannel}.`);
      setShareFor(null);
      setShareRecipient("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not share invite link."));
    }
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <div className="page-header flex-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            style={{ marginBottom: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Invite Management</div>
          <h1>Branch Invite Links</h1>
          <p>Reusable invite links scoped to this branch.</p>
        </div>
        <Button
          className="btn-premium"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <UserPlus size={18} /> Create Invite Link
        </Button>
      </div>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitesQuery.isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "32px" }}
                  >
                    <Loader2
                      size={20}
                      className="spinner"
                      style={{ display: "inline", verticalAlign: "middle" }}
                    />{" "}
                    Loading invite links…
                  </td>
                </tr>
              )}
              {invitesQuery.isError && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "var(--danger)",
                    }}
                  >
                    Could not load invite links.
                  </td>
                </tr>
              )}
              {!invitesQuery.isLoading &&
                !invitesQuery.isError &&
                invites.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      No invite links for this branch yet.
                    </td>
                  </tr>
                )}
              {invites.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <LinkIcon size={14} color="var(--text-tertiary)" />
                      <code className="monospace">{inv.code}</code>
                    </div>
                  </td>
                  <td>
                    {inv.uses} / {inv.max_uses}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${inv.status}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(inv.url)}
                        title="Copy link"
                        aria-label="Copy invite link"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShareFor({ id: inv.id, code: inv.code })
                        }
                        title="Share"
                        aria-label="Share invite link"
                      >
                        <Share2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(inv.id, inv.status)}
                        disabled={updateInvite.isPending}
                        title={
                          inv.status === "active" ? "Revoke" : "Activate"
                        }
                      >
                        <Power size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inv.id, inv.code)}
                        disabled={deleteInvite.isPending}
                        style={{ color: "var(--danger)" }}
                        aria-label="Delete invite link"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Invite Link"
      >
        <form onSubmit={handleCreate} className="form-stack-premium">
          <Input
            label="Name (display only)"
            placeholder="e.g. Workers Registration"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={errors.name}
            required
            autoFocus
          />
          <Input
            label="Max Uses"
            type="number"
            placeholder="100"
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
            error={errors.maxUses}
            required
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseCreate}
              disabled={isSaving}
            >
              <X size={16} style={{ marginRight: "6px" }} />
              Cancel
            </Button>
            <Button type="submit" className="btn-premium" disabled={isSaving}>
              {isSaving && (
                <Loader2
                  size={16}
                  className="spinner"
                  style={{ marginRight: "8px" }}
                />
              )}
              {createInvite.isPending ? "Creating…" : "Create Link"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(shareFor)}
        onClose={() => setShareFor(null)}
        title={shareFor ? `Share "${shareFor.code}"` : ""}
      >
        <form onSubmit={handleShare} className="form-stack-premium">
          <div className="input-wrapper input-full">
            <label className="input-label">Channel</label>
            <select
              className="input-field select-field"
              value={shareChannel}
              onChange={(e) =>
                setShareChannel(e.target.value as "sms" | "email")
              }
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <Input
            label={
              shareChannel === "sms"
                ? "Recipient phone (E.164)"
                : "Recipient email"
            }
            placeholder={
              shareChannel === "sms" ? "+12345678901" : "user@example.com"
            }
            value={shareRecipient}
            onChange={(e) => setShareRecipient(e.target.value)}
            error={errors.recipient}
            required
            autoFocus
          />
          <Button
            type="submit"
            className="btn-premium"
            fullWidth
            disabled={isSaving}
          >
            {isSaving && (
              <Loader2
                size={16}
                className="spinner"
                style={{ marginRight: "8px" }}
              />
            )}
            Share Invite
          </Button>
        </form>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Invite link created"
        description="Your reusable invite link is ready to share."
        primaryAction={{
          label: "Okay",
          onClick: () => setShowSuccess(false),
        }}
        icon="shield"
      />
    </div>
  );
}
