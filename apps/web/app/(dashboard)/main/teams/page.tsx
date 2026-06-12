"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/services/auth";
import { useLocationMembers } from "@/services/manage-organization";
import {
  Search,
  MapPin,
  Shield,
  MessageCircle,
  Smartphone,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import "../main.css";
import "./teams.css";

export default function TeamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const membersQuery = useLocationMembers(branchId);
  const [searchTerm, setSearchTerm] = useState("");

  const members = membersQuery.data?.data ?? [];
  const filtered = members.filter((m) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.phone.includes(searchTerm);
  });

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
          <div className="header-badge">Workforce Management</div>
          <h1>Organizational Teams</h1>
          <p>Manage all members across your teams and locations.</p>
        </div>
        <Button
          className="btn-premium"
          onClick={() => router.push("/main/manage-organization")}
        >
          <Plus size={18} /> <span>Create New Team</span>
        </Button>
      </div>

      <Card className="filter-card">
        <div className="filter-grid-premium">
          <div className="premium-search-bar" style={{ flex: 2 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search members by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="members-list-container">
        <div className="desktop-only">
          <Card className="table-card-premium">
                <table className="data-table-premium">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Roles</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersQuery.isLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      <Loader2
                        size={20}
                        className="spinner"
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Loading members…
                    </td>
                  </tr>
                )}
                {membersQuery.isError && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--danger)",
                      }}
                    >
                      Could not load members.
                    </td>
                  </tr>
                )}
                {!membersQuery.isLoading &&
                  !membersQuery.isError &&
                  filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "32px" }}
                      >
                        {searchTerm
                          ? "No members match your search."
                          : "No members yet."}
                      </td>
                    </tr>
                  )}
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div className="user-avatar-tiny">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{m.name}</span>
                          {m.team_admins.length > 0 && (
                            <Shield
                              size={14}
                              className="text-primary"
                              fill="var(--blue-subtle)"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="team-tags-row">
                        {m.roles.length === 0 ? (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            —
                          </span>
                        ) : (
                          m.roles.map((r) => (
                            <span key={r} className="team-pill-mini">
                              {r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="monospace">{m.phone}</td>
                    <td>
                      <span
                        className={`role-badge role-${m.status}`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-icon-btn whatsapp"
                          aria-label={`Message ${m.name} on WhatsApp`}
                        >
                          <MessageCircle size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-icon-btn sms"
                          aria-label={`Send SMS to ${m.name}`}
                        >
                          <Smartphone size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="mobile-only teams-mobile-stack">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className="member-mobile-card-premium fade-in"
            >
              <div className="member-card-main">
                <div className="member-avatar-box">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info-box">
                  <div className="name-row">
                    <h4>{m.name}</h4>
                    {m.team_admins.length > 0 && (
                      <Shield size={14} className="text-primary" />
                    )}
                  </div>
                  <div className="phone-row">{m.phone}</div>
                  <div className="location-row">
                    <MapPin size={12} /> {user?.branch_id ? "This branch" : "—"}
                  </div>
                  {m.roles.length > 0 && (
                    <div className="teams-row">
                      {m.roles.map((r) => (
                        <span key={r} className="team-badge-v3">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="member-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  style={{ gap: "8px" }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  style={{ gap: "8px" }}
                >
                  <Smartphone size={16} /> SMS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
