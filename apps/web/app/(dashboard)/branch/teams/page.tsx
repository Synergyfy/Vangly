"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  ChevronRight,
  Settings,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/auth";
import {
  useCreateTeam,
  useLocationTeams,
} from "@/services/manage-organization";
import "./groups.css";

export default function ManageTeamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const teamsQuery = useLocationTeams(branchId);
  const createTeam = useCreateTeam();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = createTeam.isPending;

  const teams = teamsQuery.data?.data ?? [];
  const filtered = teams.filter((t) =>
    searchTerm
      ? t.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const resetForm = () => {
    setNewName("");
    setNewDescription("");
    clearAll();
  };

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setTimeout(resetForm, 250);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

    if (!branchId) {
      toast.error("No location associated with your account.");
      return;
    }
    if (!newName.trim()) {
      setError("name", "Team name is required.");
      return;
    }
    try {
      await createTeam.mutateAsync({
        locationId: branchId,
        input: {
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        },
      });
      toast.success(`Team "${newName.trim()}" created.`);
      setShowSuccess(true);
      handleClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create team."));
    }
  };

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
            onClick={() => router.push("/branch")}
          >
            <ArrowLeft size={18} /> Back to Hub
          </button>

          <div className="badge-premium purple">TEAM OPERATIONS</div>
          <h1>Location Teams</h1>
          <p>
            Organize your outreach workers into focused, high-impact units.
          </p>
        </div>

        <div className="header-actions">
          <Button
            className="btn-premium"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!branchId}
          >
            <Plus size={18} /> Create New Team
          </Button>
        </div>
      </header>

      <div className="teams-grid-view fade-in">
        <div className="section-actions" style={{ marginBottom: "32px" }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div
          className="teams-grid-premium"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {teamsQuery.isLoading && (
            <Card className="team-main-card" style={{ textAlign: "center" }}>
              <Loader2
                size={20}
                className="spinner"
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              Loading teams…
            </Card>
          )}
          {teamsQuery.isError && (
            <Card
              className="team-main-card"
              style={{ textAlign: "center", color: "var(--danger)" }}
            >
              Could not load teams.
            </Card>
          )}
          {!teamsQuery.isLoading &&
            !teamsQuery.isError &&
            filtered.length === 0 && (
              <Card
                className="team-main-card"
                style={{ textAlign: "center" }}
              >
                {searchTerm
                  ? "No teams match your search."
                  : "No teams yet. Click Create New Team to get started."}
              </Card>
            )}
          {filtered.map((team) => (
            <Card
              key={team.id}
              className="team-main-card"
              onClick={() => router.push(`/branch/teams/${team.id}`)}
            >
              <div className="team-card-header">
                <div className="team-icon-box">
                  <Users size={24} />
                </div>
                <div className="team-title-group">
                  <h3>{team.name}</h3>
                  {team.description && <p>{team.description}</p>}
                </div>
                <ChevronRight size={20} className="text-tertiary" />
              </div>

              <div className="team-card-stats">
                <div className="t-stat">
                  <span className="label">Members</span>
                  <span className="value">{team.member_count}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Forms</span>
                  <span className="value">{team.form_count}</span>
                </div>
                <div className="t-stat">
                  <span className="label">Kind</span>
                  <span
                    className="value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {team.kind}
                  </span>
                </div>
              </div>

              <div className="team-card-footer">
                <div className="admin-info">
                  Created {new Date(team.created_at).toLocaleDateString()}
                </div>
                <div className="footer-actions">
                  <button
                    className="icon-action"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Team settings"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    className="icon-action"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Message team"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleClose}
        title="Create New Team"
      >
        <form onSubmit={handleCreate} className="form-stack-premium">
          <Input
            label="Team Name"
            placeholder="e.g. West Campus Outreach"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={errors.name}
            required
            autoFocus
          />
          <Input
            label="Description (Optional)"
            placeholder="What does this team do?"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Button
            type="submit"
            className="btn-premium"
            fullWidth
            size="lg"
            disabled={isSaving}
          >
            {isSaving && (
              <Loader2
                size={16}
                className="spinner"
                style={{ marginRight: "8px" }}
              />
            )}
            {isSaving ? "Creating…" : "Create Team"}
          </Button>
        </form>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Team created"
        description="Your new team is ready to receive members and forms."
        primaryAction={{
          label: "Okay",
          onClick: () => setShowSuccess(false),
        }}
        icon="shield"
      />
    </div>
  );
}
