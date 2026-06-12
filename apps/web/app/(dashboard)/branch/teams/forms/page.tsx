"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import {
  useLocationTeams,
  useTeamForms,
} from "@/services/manage-organization";
import "../groups.css";

export default function TeamFormsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const teamsQuery = useLocationTeams(branchId, { per_page: 100 });
  const [selectedTeamId] = useState<string | null>(null);
  const teams = teamsQuery.data?.data ?? [];

  const teamOptions = teams.length > 0
    ? (selectedTeamId
        ? teams.filter((t) => t.id === selectedTeamId)
        : teams)
    : [];

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
          <div className="badge-premium blue">OPERATIONAL TOOLS</div>
          <h1>Team Outreach Forms</h1>
          <p>
            Manage and distribute forms across all your location&apos;s outreach
            units.
          </p>
        </div>
      </header>

      <main className="dashboard-main-content">
        {teamsQuery.isLoading && (
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
            Loading teams…
          </div>
        )}

        {!teamsQuery.isLoading && teams.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "var(--text-tertiary)",
            }}
          >
            No teams found. Create a team first.
          </div>
        )}

        {teamOptions.map((team) => (
          <div key={team.id} style={{ marginBottom: "32px" }}>
            <div
              className="team-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
                {team.name}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/branch/teams/${team.id}`)
                }
              >
                <Plus size={16} /> New Form
              </Button>
            </div>

            <div
              className="forms-list"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <TeamFormsList teamId={team.id} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function TeamFormsList({
  teamId,
}: {
  teamId: string;
}) {
  const { data, isLoading, isError } = useTeamForms(teamId);

  if (isLoading) {
    return (
      <div style={{ color: "var(--text-tertiary)", padding: "16px" }}>
        Loading forms…
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ color: "var(--danger)", padding: "16px" }}>
        Could not load forms.
      </div>
    );
  }

  const forms = data?.data ?? [];

  if (forms.length === 0) {
    return (
      <Card style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)" }}>
        No forms yet for this team.
      </Card>
    );
  }

  return (
    <>
      {forms.map((form) => (
        <Card
          key={form.id}
          className="team-main-card"
          style={{ padding: "20px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <FileText size={24} style={{ color: "var(--blue)" }} />
              <div>
                <h4 style={{ fontWeight: 700, margin: 0 }}>{form.title}</h4>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    margin: "4px 0 0",
                  }}
                >
                  {form.analytics_submissions} submissions &bull;{" "}
                  {form.status}
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-tertiary)" }} />
          </div>
        </Card>
      ))}
    </>
  );
}
