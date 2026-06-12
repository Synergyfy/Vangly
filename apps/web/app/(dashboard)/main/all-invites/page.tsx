"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useInvitesList } from "@/services/invites";
import { useLocationsList } from "@/services/manage-organization";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Search,
  Link as LinkIcon,
  Users,
  Copy,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../main.css";

export default function AllInvitesPage() {
  const router = useRouter();
  const invitesQuery = useInvitesList();
  const locationsQuery = useLocationsList();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const locations = locationsQuery.data?.data ?? [];

  const filtered = (invitesQuery.data ?? []).filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      i.code.toLowerCase().includes(q) ||
      (i.location_id ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const locationName = (id?: string) =>
    locations.find((l) => l.id === id)?.name ?? "All Locations";

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not copy link."));
    }
  };

  const handleBulkMessage = () => {
    router.push("/main/messages?mode=all_invites");
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="back-btn-pill"
            style={{ marginBottom: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Outreach Central</div>
          <h1>All Invite Links</h1>
          <p>Consolidated list of all invite links across all locations.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleBulkMessage}
          className="btn-premium"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Users size={18} /> <span>Bulk Message</span>
        </Button>
      </div>

      <Card
        className="filter-card-premium glass-morphism"
        style={{ marginBottom: "32px" }}
      >
        <div className="filter-grid-v2">
          <div className="premium-search-bar" style={{ flex: 1.5 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by code or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="filter-controls-group">
            <div className="premium-select-box">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="table-card-premium">
        <div className="table-responsive">
          <table className="data-table-premium">
            <thead>
              <tr>
                <th>Code</th>
                <th>Location</th>
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
                    colSpan={6}
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
                paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      No invite links match your filters.
                    </td>
                  </tr>
                )}
              {paginated.map((inv) => (
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <MapPin size={12} /> {locationName(inv.location_id)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              padding: "16px",
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} /> Prev
            </Button>
            <span style={{ fontSize: "13px" }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
