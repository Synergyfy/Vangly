"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useInvitesList } from "@/services/invites";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import {
  ChevronLeft,
  Mail,
  Loader2,
  Copy,
  MessageSquare,
} from "lucide-react";
import "../../branch.css";

function WorkerInvitesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerName = searchParams.get("name") || "Worker";
  const workerId = searchParams.get("id");

  const invitesQuery = useInvitesList();

  const invites = (invitesQuery.data ?? []).filter(
    (inv) => !workerId || inv.owner_user_id === workerId,
  );

  const handleMessageUser = (phone: string) => {
    router.push(
      `/branch/messages?recipient=${encodeURIComponent(phone)}&mode=custom`,
    );
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not copy link."));
    }
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              style={{
                padding: "0 8px",
                minWidth: "unset",
                width: "36px",
                height: "36px",
              }}
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </Button>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(18px, 5vw, 24px)",
                  lineHeight: 1.2,
                }}
              >
                {workerName}&apos;s invite links
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                Reusable invite links this member has created.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/branch/messages?mode=custom")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Mail size={18} /> Message All
          </Button>
        </div>
      </div>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Uses</th>
                <th>Max Uses</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitesQuery.isLoading && (
                <tr>
                  <td
                    colSpan={6}
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
                    colSpan={6}
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
                      colSpan={6}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      No invite links created by this worker yet.
                    </td>
                  </tr>
                )}
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td data-label="Code">
                    <code className="monospace">{invite.code}</code>
                  </td>
                  <td data-label="Uses">{invite.uses}</td>
                  <td data-label="Max Uses">{invite.max_uses}</td>
                  <td data-label="Status">
                    <span
                      className={`status-badge status-${invite.status}`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {invite.status}
                    </span>
                  </td>
                  <td data-label="Created">
                    {new Date(invite.created_at).toLocaleDateString()}
                  </td>
                  <td data-label="Actions">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(invite.url)}
                        title="Copy link"
                        style={{ padding: "0 8px", width: "36px" }}
                        aria-label="Copy invite link"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessageUser("")}
                        title="Send message"
                        style={{ padding: "0 8px", width: "36px" }}
                        aria-label="Send message"
                      >
                        <MessageSquare size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function BranchWorkerInvitesPage() {
  return (
    <Suspense fallback={<div>Loading invites...</div>}>
      <WorkerInvitesContent />
    </Suspense>
  );
}
