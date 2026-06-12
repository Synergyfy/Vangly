"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/services/auth";
import {
  useTeamDetail,
} from "@/services/manage-organization";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "../groups.css";

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const teamQuery = useTeamDetail(branchId, teamId);

  const [activeTab, setActiveTab] = useState<"teams" | "forms">("teams");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const team = teamQuery.data?.team;
  const teamMembers = teamQuery.data?.members ?? [];
  const teamForms = teamQuery.data?.forms ?? [];

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    toast.success(`${newMemberName} added to ${team?.name ?? "team"}.`);
    setNewMemberName("");
    setIsAddMemberModalOpen(false);
  };

  if (teamQuery.isLoading) {
    return (
      <div className="hq-dashboard-premium teams-container-v2 animate-premium">
        <div style={{ textAlign: "center", padding: "64px", color: "var(--text-tertiary)" }}>
          <Loader2 size={24} className="spinner" style={{ display: "inline", verticalAlign: "middle" }} /> Loading team…
        </div>
      </div>
    );
  }

  if (teamQuery.isError || !team) {
    return (
      <div className="hq-dashboard-premium teams-container-v2 animate-premium">
        <div style={{ textAlign: "center", padding: "64px", color: "var(--danger)" }}>
          {extractErrorMessage(teamQuery.error, "Team not found.")}
        </div>
      </div>
    );
  }

  return (
    <div className="hq-dashboard-premium teams-container-v2 animate-premium">
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
            onClick={() => router.push("/branch/teams")}
          >
            <ArrowLeft size={18} /> Back to Teams
          </button>
          <div className="badge-premium purple">TEAM DETAILS</div>
          <h1>{team.name}</h1>
          <p>
            {team.member_count} members &bull; {team.form_count} forms
          </p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "8px" }}>
          <Button
            className="btn-premium"
            onClick={() => setIsAddMemberModalOpen(true)}
          >
            <Plus size={18} /> Add Member
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="tabs-switch-premium" style={{ marginBottom: "24px" }}>
          {(["teams", "forms"] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-single ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "teams" ? (
                <Users size={16} />
              ) : (
                <FileText size={16} />
              )}
              {tab === "teams" ? "Members" : "Forms"}
            </button>
          ))}
        </div>

        {activeTab === "teams" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
                Team Members ({team.member_count})
              </h2>
            </div>

            {teamMembers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {teamMembers.map((member) => (
                  <Card key={member.id} style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "var(--bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "var(--blue)",
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, flex: 1 }}>
                        {member.name}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        {member.phone}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "var(--text-tertiary)",
                }}
              >
                No members yet. Click Add Member to add someone.
              </div>
            )}
          </div>
        )}

        {activeTab === "forms" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
                Forms ({team.form_count})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/branch/forms")}
              >
                <FileText size={16} /> View All
              </Button>
            </div>

            {teamForms.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {teamForms.map((form) => (
                  <Card key={form.id} style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <FileText
                          size={20}
                          style={{ color: "var(--blue)" }}
                        />
                        <div>
                          <span style={{ fontWeight: 600 }}>
                            {form.title}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-tertiary)",
                              marginLeft: "8px",
                            }}
                          >
                            {form.submissions} submissions
                          </span>
                        </div>
                      </div>
                      <span
                        className="status-pill"
                        style={{
                          fontSize: "10px",
                          padding: "2px 8px",
                          textTransform: "capitalize",
                        }}
                      >
                        {form.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "var(--text-tertiary)",
                }}
              >
                No forms for this team yet.
              </div>
            )}
          </div>
        )}
      </main>

      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            paddingBottom: "24px",
          }}
        >
          <Input
            label="Member Name"
            placeholder="Enter name"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            required
            autoFocus
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-premium"
              fullWidth
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
