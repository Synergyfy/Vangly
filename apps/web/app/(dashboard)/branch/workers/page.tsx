"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  ArrowLeft,
  MoreHorizontal,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import { useDeleteUser, useUsersList } from "@/services/users";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import "../branch.css";

export default function BranchWorkersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const usersQuery = useUsersList({ branch_id: branchId ?? undefined });
  const deleteUser = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const users = usersQuery.data ?? [];
  const workers = users.filter(
    (u) => u.role === "worker" || u.role === "location_admin",
  );
  const activeCount = workers.filter((u) => !u.suspended).length;
  const filtered = workers.filter((w) =>
    searchTerm
      ? w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.phone.includes(searchTerm)
      : true,
  );

  const handleRemove = async (id: string, name: string) => {
    setActiveActionId(null);
    if (!window.confirm(`Remove ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser.mutateAsync(id);
      toast.success(`${name} removed.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove worker."));
    }
  };

  return (
    <div
      className="hq-dashboard-premium animate-premium"
      style={{ paddingBottom: "100px" }}
    >
      <header
        className="dashboard-header-premium"
        style={{
          border: "none",
          background: "transparent",
          padding: "24px 0",
        }}
      >
        <div className="header-left">
          <button
            className="back-link-premium"
            onClick={() => router.push("/branch")}
          >
            <ArrowLeft size={18} /> Back to Hub
          </button>

          <div className="badge-premium purple">WORKFORCE MANAGEMENT</div>
          <h1>Location Workers</h1>
          <p>Manage roles, track performance, and assign workers to teams.</p>
        </div>

        <div className="header-actions">
          <Button
            className="btn-premium"
            onClick={() => router.push("/branch/user-setup")}
          >
            <UserPlus size={18} /> Add New Worker
          </Button>
        </div>
      </header>

      <div className="dashboard-main-content">
        <div
          className="stats-cards-grid"
          style={{ marginBottom: "32px" }}
        >
          {[
            {
              label: "Total Workers",
              value: workers.length,
              icon: Users,
              color: "#a855f7",
            },
            {
              label: "Active Now",
              value: activeCount,
              icon: CheckCircle,
              color: "#10b981",
            },
            {
              label: "Total Invites",
              value: workers.reduce(
                (sum, w) => sum + w.invites_count,
                0,
              ),
              icon: TrendingUp,
              color: "#3b82f6",
            },
          ].map((s, i) => (
            <Card key={i} className="stat-card-premium">
              <div
                className="stat-icon"
                style={{ background: `${s.color}10`, color: s.color }}
              >
                <s.icon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="section-actions" style={{ marginBottom: "24px" }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search workers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="user-list-card-premium">
          <table className="location-users-table">
            <thead>
              <tr>
                <th>Worker Info</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
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
                    Loading workers…
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "var(--danger)",
                    }}
                  >
                    Could not load workers.
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      {searchTerm
                        ? "No workers match your search."
                        : "No workers yet. Click Add New Worker to get started."}
                    </td>
                  </tr>
                )}
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        className="user-avatar-tiny"
                        style={{ background: "#f5f3ff", color: "#8b5cf6" }}
                      >
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>
                          {w.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {w.invites_count} invites
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="monospace">{w.phone}</td>
                  <td>
                    <span
                      className="admin-badge-mini purple"
                      style={{ width: "fit-content" }}
                    >
                      {w.role === "location_admin"
                        ? "Location Admin"
                        : "Worker"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${w.suspended ? "pending" : "active"}`}
                      style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: w.suspended ? "#fef2f2" : "#f0fdf4",
                        color: w.suspended ? "#dc2626" : "#16a34a",
                        fontWeight: 700,
                      }}
                    >
                      {w.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", position: "relative" }}>
                    <button
                      className="icon-action"
                      onClick={() =>
                        setActiveActionId(activeActionId === w.id ? null : w.id)
                      }
                      aria-label={`Actions for ${w.name}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeActionId === w.id && (
                      <div
                        className="action-dropdown"
                        style={{ display: "flex", right: 0 }}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setActiveActionId(null);
                            toast.info(
                              "Role changes are not supported yet. Edit the user from User Setup.",
                            );
                          }}
                        >
                          <ShieldCheck size={14} /> Change Role
                        </button>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleRemove(w.id, w.name)}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {activeActionId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 90 }}
          onClick={() => setActiveActionId(null)}
        />
      )}
    </div>
  );
}
