"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FileText,
  Plus,
  Search,
  Settings,
  ArrowLeft,
  Layout,
  GripVertical,
  Trash,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { toast } from "sonner";
import { useAuth } from "@/services/auth";
import {
  useLocation,
  useLocationTeams,
  useCreateForm,
} from "@/services/manage-organization";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import type { FormField, FormFieldType } from "@/types/api/teams";
import "../branch.css";

const FIELD_TYPES = [
  { id: "text", label: "Short Text", cat: "Standard" },
  { id: "longtext", label: "Long Text", cat: "Standard" },
  { id: "number", label: "Number", cat: "Standard" },
  { id: "email", label: "Email", cat: "Standard" },
  { id: "phone", label: "Phone", cat: "Standard" },
  { id: "checkbox", label: "Checkbox", cat: "Choice" },
  { id: "radio", label: "Radio Choice", cat: "Choice" },
  { id: "dropdown", label: "Dropdown", cat: "Choice" },
  { id: "date", label: "Date", cat: "Date & Time" },
  { id: "rating", label: "Rating", cat: "Advanced" },
  { id: "address", label: "Address", cat: "Advanced" },
  { id: "divider", label: "Divider", cat: "Layout" },
];

export default function BranchFormsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const locationQuery = useLocation(branchId);
  const teamsQuery = useLocationTeams(branchId, { per_page: 100 });
  const createForm = useCreateForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTeamId, setBuilderTeamId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const teams = (teamsQuery.data?.data ?? []).filter((t) =>
    searchTerm
      ? t.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const startCreateForm = (teamId: string) => {
    setBuilderTeamId(teamId);
    setFormTitle("");
    setFormFields([]);
    setIsBuilderOpen(true);
  };

  const fieldCounter = useRef(0);
  const addField = (typeId: string) => {
    fieldCounter.current += 1;
    setFormFields((prev) => [
      ...prev,
      {
        key: `f_${fieldCounter.current}`,
        label: "",
        type: typeId as FormFieldType,
        required: false,
      },
    ]);
  };

  const updateField = (idx: number, patch: Partial<FormField>) => {
    setFormFields((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handlePublish = async () => {
    if (!builderTeamId || !formTitle.trim()) {
      toast.error("Form title is required.");
      return;
    }
    try {
      await createForm.mutateAsync({
        teamId: builderTeamId,
        input: { title: formTitle, team_id: builderTeamId, fields: formFields },
      });
      setIsBuilderOpen(false);
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create form."));
    }
  };

  return (
    <div className="hq-dashboard-premium animate-premium" style={{ paddingBottom: "100px" }}>
      <header
        className="dashboard-header-premium"
        style={{ border: "none", background: "transparent", padding: "24px 0" }}
      >
        <div className="header-left">
          <button
            className="back-link-premium"
            onClick={() => router.push("/branch")}
          >
            <ArrowLeft size={18} /> Back to Hub
          </button>
          <div className="badge-premium blue">OPERATIONAL TOOLS</div>
          <h1>
            {locationQuery.data?.name ?? "Branch"} Forms
          </h1>
          <p>Create and manage outreach forms for this branch.</p>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="section-actions" style={{ marginBottom: "24px" }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {teamsQuery.isLoading && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
            <Loader2 size={20} className="spinner" style={{ display: "inline", verticalAlign: "middle" }} /> Loading teams…
          </div>
        )}

        <div
          className="forms-display-grid-premium"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {teams.map((team) => (
            <Card key={team.id} className="team-main-card" style={{ padding: "24px" }}>
              <div
                className="form-card-main-info"
                style={{ display: "flex", gap: "16px", marginBottom: "16px" }}
              >
                <div
                  className="team-icon-box"
                  style={{
                    background: "#eff6ff",
                    color: "#3b82f6",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span className="admin-badge-mini blue" style={{ fontSize: "10px" }}>
                      {team.is_public_joinable ? "PUBLIC" : "PRIVATE"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
                    {team.name}
                  </h3>
                </div>
              </div>

              <div
                className="team-card-stats"
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <div className="t-stat">
                  <span className="label">Members</span>
                  <span className="value" style={{ fontSize: "14px" }}>
                    {team.member_count}
                  </span>
                </div>
                <div className="t-stat">
                  <span className="label">Forms</span>
                  <span className="value" style={{ fontSize: "14px" }}>
                    {team.form_count}
                  </span>
                </div>
              </div>

              <div
                className="form-card-v2-actions"
                style={{ display: "flex", gap: "8px", marginTop: "16px" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => router.push(`/branch/teams/${team.id}`)}
                >
                  <Settings size={16} /> Manage
                </Button>
                <Button
                  className="btn-premium"
                  size="sm"
                  fullWidth
                  onClick={() => startCreateForm(team.id)}
                >
                  <Plus size={16} /> New Form
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Create Form"
        size="full"
      >
        <div className="form-builder-container-premium">
          <div className="builder-interface fade-in">
            <div className="builder-header-sticky">
              <div className="header-main-info">
                <div className="title-area" style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-title-input-ghost"
                    placeholder="Form Title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{
                      width: "100%",
                      fontSize: "24px",
                      fontWeight: 800,
                      border: "none",
                      outline: "none",
                      padding: "8px 0",
                    }}
                  />
                </div>
                <div className="header-actions" style={{ display: "flex", gap: "8px" }}>
                  <Button
                    className="btn-premium"
                    size="sm"
                    onClick={handlePublish}
                    disabled={createForm.isPending || !formTitle.trim()}
                  >
                    {createForm.isPending ? "Publishing…" : "Publish"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="builder-body-scrollable" style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {FIELD_TYPES.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => addField(ft.id)}
                    style={{
                      padding: "6px 14px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "8px",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    + {ft.label}
                  </button>
                ))}
              </div>

              <div className="fields-stack">
                {formFields.length === 0 && (
                  <div
                    className="empty-builder-state"
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <Layout size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                    <p>Click a field type above to add it.</p>
                  </div>
                )}
                {formFields.map((field, idx) => (
                  <div key={field.key} className="field-card-premium" style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <GripVertical size={16} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                      <Input
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <label
                        className="toggle-label-premium"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={field.required ?? false}
                          onChange={(e) =>
                            updateField(idx, { required: e.target.checked })
                          }
                        />
                        Required
                      </label>
                      <button
                        onClick={() =>
                          setFormFields((prev) =>
                            prev.filter((f) => f.key !== field.key),
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--danger)",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        aria-label="Remove field"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="form"
        title="Form Created"
        description="The form has been published successfully."
        primaryAction={{
          label: "Back to Forms",
          navigateTo: "/branch/forms",
        }}
      />
    </div>
  );
}
