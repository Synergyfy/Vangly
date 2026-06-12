"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Users,
  Send,
  CheckCircle2,
  MoreHorizontal,
  Filter,
  Download,
  ArrowLeft,
  Loader2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useLocationsList,
} from "@/services/manage-organization";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "../main.css";

export default function HQOverviewPage() {
  const router = useRouter();
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const locationsQuery = useLocationsList({ per_page: 100 });

  const locations = locationsQuery.data?.data ?? [];

  const totals = locations.reduce(
    (acc, l) => {
      acc.teams += l.stats.teams;
      acc.members += l.stats.members;
      acc.submissions += l.stats.submissions_30d;
      return acc;
    },
    { teams: 0, members: 0, submissions: 0 },
  );

  const toggleDropdown = (id: string) => {
    setActiveBranchId(activeBranchId === id ? null : id);
  };

  const handleView = (id: string, name: string) => {
    setActiveBranchId(null);
    router.push(
      `/main/manage-organization/location?id=${id}&name=${encodeURIComponent(
        name,
      )}`,
    );
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="back-btn-pill"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <h1>Location Performance</h1>
          <p>Detailed growth analytics across all organization hubs</p>
        </div>
        <div
          className="header-actions header-actions-mobile-hidden"
          style={{ display: "flex", gap: "8px" }}
        >
          <Button
            variant="outline"
            size="sm"
            style={{ padding: "8px" }}
            aria-label="Filter"
          >
            <Filter size={18} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            style={{ padding: "8px" }}
            aria-label="Download"
          >
            <Download size={18} />
          </Button>
        </div>
      </header>

      <div className="dashboard-main-content">
        <section
          className="quick-actions-section"
          style={{ marginBottom: "32px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              Management Actions
            </h2>
          </div>
          <div
            className="quick-actions-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Add Location",
                icon: Building2,
                path: "/main/manage-organization/new",
                color: "#3b82f6",
              },
              {
                label: "New Message",
                icon: Send,
                path: "/main/messages",
                color: "#8b5cf6",
              },
              {
                label: "Setup Teams",
                icon: Users,
                path: "/main/manage-organization",
                color: "#f59e0b",
              },
              {
                label: "Buy Credits",
                icon: CheckCircle2,
                path: "/main/wallet",
                color: "#10b981",
              },
            ].map((action, i) => (
              <button
                key={i}
                className="action-btn-mobile glass-morphism"
                onClick={() => router.push(action.path)}
                style={{
                  background: "white",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  className="action-icon"
                  style={{
                    color: action.color,
                    background: `${action.color}10`,
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <action.icon size={20} />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                  }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="content-section" style={{ marginBottom: "32px" }}>
          <h2 className="section-title" style={{ marginBottom: "16px" }}>
            Growth Analytics
          </h2>
          <div className="stats-grid-premium">
            <Card className="stat-card-premium glass-morphism">
              <div className="icon-box blue">
                <Building2 size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Locations</span>
                <div className="stat-value-row">
                  <span className="stat-value">
                    {locationsQuery.isLoading ? "…" : locations.length}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  {locations.filter((l) => l.is_hq).length} HQ
                </div>
              </div>
            </Card>
            <Card className="stat-card-premium glass-morphism">
              <div className="icon-box purple">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Workers</span>
                <div className="stat-value-row">
                  <span className="stat-value">
                    {locationsQuery.isLoading ? "…" : totals.members}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Across all locations
                </div>
              </div>
            </Card>
            <Card className="stat-card-premium glass-morphism">
              <div className="icon-box orange">
                <Send size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Form Submissions (30d)</span>
                <div className="stat-value-row">
                  <span className="stat-value">
                    {locationsQuery.isLoading ? "…" : totals.submissions}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Last 30 days
                </div>
              </div>
            </Card>
            <Card className="stat-card-premium glass-morphism">
              <div className="icon-box green">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Teams</span>
                <div className="stat-value-row">
                  <span className="stat-value">
                    {locationsQuery.isLoading ? "…" : totals.teams}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Active groups
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="table-card-premium" style={{ marginTop: "0" }}>
          <div className="mobile-list-view">
            {locationsQuery.isLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "var(--text-tertiary)",
                }}
              >
                <Loader2
                  size={20}
                  className="spinner"
                  style={{ display: "inline", verticalAlign: "middle" }}
                />{" "}
                Loading locations…
              </div>
            )}
            {locationsQuery.isError && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "var(--danger)",
                }}
              >
                {extractErrorMessage(
                  locationsQuery.error,
                  "Could not load locations.",
                )}
              </div>
            )}
            {!locationsQuery.isLoading &&
              !locationsQuery.isError &&
              locations.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  No locations yet. Add your first branch to get started.
                </div>
              )}
            {locations.map((location) => (
              <div
                key={location.id}
                className="location-performance-card"
                onClick={() => handleView(location.id, location.name)}
              >
                <div className="location-card-top">
                  <div className="location-card-identity">
                    <span className="location-card-name">{location.name}</span>
                    <span
                      className={`status-pill ${location.status.toLowerCase()}`}
                    >
                      {location.status}
                    </span>
                  </div>
                  <MoreHorizontal size={18} className="text-tertiary" />
                </div>

                <div className="location-card-stats-grid">
                  <div className="location-card-stat">
                    <span className="label">Workers</span>
                    <span className="value">{location.stats.members}</span>
                  </div>
                  <div className="location-card-stat">
                    <span className="label">Teams</span>
                    <span className="value">{location.stats.teams}</span>
                  </div>
                  <div className="location-card-stat">
                    <span className="label">Submissions</span>
                    <span className="value text-success">
                      {location.stats.submissions_30d}
                    </span>
                  </div>
                  <div className="location-card-stat">
                    <span className="label">Activity</span>
                    <span className="value">{location.activity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="table-responsive desktop-only">
            <table className="data-table-premium">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Workers</th>
                  <th>Teams</th>
                  <th>Submissions (30d)</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td>
                      <div className="location-info-cell">
                        <span className="location-name-text">
                          {location.name}
                        </span>
                        {location.is_hq ? (
                          <span
                            className="status-dot active"
                            style={{ marginLeft: "8px" }}
                          >
                            HQ
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{location.stats.members}</td>
                    <td>{location.stats.teams}</td>
                    <td className="text-success font-medium">
                      {location.stats.submissions_30d}
                    </td>
                    <td>
                      <span
                        className={`status-dot ${location.status.toLowerCase()}`}
                      >
                        {location.status}
                      </span>
                    </td>
                    <td className="relative">
                      <button
                        className="btn-icon-only"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(location.id);
                        }}
                        aria-label="Actions"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeBranchId === location.id && (
                        <div className="dropdown-panel-premium">
                          <button
                            className="dropdown-item"
                            onClick={() => handleView(location.id, location.name)}
                          >
                            <Eye size={14} /> View Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
