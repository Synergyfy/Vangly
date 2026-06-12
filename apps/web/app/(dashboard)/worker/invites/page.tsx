"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/services/auth";
import {
  useDeleteInvite,
  useInvitesList,
  useShareInvite,
} from "@/services/invites";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Search,
  Copy,
  Loader2,
  Share2,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import "./invites.css";

export default function InvitesListPage() {
  const { user } = useAuth();
  const invitesQuery = useInvitesList();
  const deleteInvite = useDeleteInvite();
  const shareInvite = useShareInvite();

  const [searchTerm, setSearchTerm] = useState("");
  const [shareFor, setShareFor] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [shareChannel, setShareChannel] = useState<"sms" | "email">("sms");
  const [shareRecipient, setShareRecipient] = useState("");

  const { errors, setError, clearAll } = useFieldErrors();

  const myInvites = (invitesQuery.data ?? []).filter(
    (i) => !user?.id || i.owner_user_id === user.id,
  );
  const filtered = myInvites.filter((i) =>
    searchTerm
      ? i.code.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not copy link."));
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
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Outreach Tracking</div>
          <h1>My Invite Links</h1>
          <p>View and manage the invite links you have created.</p>
        </div>
        <Link href="/worker/add-invite">
          <Button className="btn-premium">
            <Plus size={18} /> Add New Invite
          </Button>
        </Link>
      </div>

      <Card className="management-filter-card">
        <div className="search-container-premium">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="user-table-card-premium">
        <div className="table-responsive">
          <table className="user-data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Action</th>
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
                    Loading…
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
                filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      {searchTerm
                        ? "No invite links match your search."
                        : "No invite links yet. Click Add New Invite to create one."}
                    </td>
                  </tr>
                )}
              {filtered.map((inv) => (
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
                  <td className="text-right">
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(inv.url)}
                        title="Copy"
                        aria-label="Copy link"
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
            disabled={shareInvite.isPending}
          >
            {shareInvite.isPending && (
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
    </div>
  );
}
