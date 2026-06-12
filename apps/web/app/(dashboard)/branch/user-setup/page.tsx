"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Modal } from "@/components/ui/Modal";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { isE164 } from "@/lib/forms/validators";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import { useAuth } from "@/services/auth";
import {
  useCreateUser,
  useDeleteUser,
  useUsersList,
} from "@/services/users";
import type { AdminUserRole } from "@/types/api/users";
import {
  UserPlus,
  Search,
  ArrowLeft,
  Loader2,
  Trash2,
  X,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import "../branch.css";

const ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: "worker", label: "Worker" },
  { value: "location_admin", label: "Location Admin" },
];

export default function BranchUserSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const usersQuery = useUsersList({ branch_id: user?.branch_id ?? undefined });
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminUserRole>("worker");

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = createUser.isPending;

  const users = usersQuery.data ?? [];
  const filtered = users.filter((u) =>
    searchTerm
      ? `${u.name} ${u.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setRole("worker");
    clearAll();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 250);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

    if (!user?.branch_id) {
      toast.error("No location associated with your account.");
      return;
    }
    if (!name.trim()) {
      setError("name", "Full name is required.");
      return;
    }
    if (!isE164(phone)) {
      setError(
        "phone",
        "Phone number must be in E.164 format (e.g. +12345678901).",
      );
      return;
    }

    try {
      await createUser.mutateAsync({
        name: name.trim(),
        phone,
        role,
        branch_id: user.branch_id,
      });
      toast.success(`User "${name.trim()}" created.`);
      setShowSuccess(true);
      handleClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create user."));
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!window.confirm(`Remove ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser.mutateAsync(id);
      toast.success(`${userName} removed.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove user."));
    }
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="back-btn-pill"
            style={{ marginBottom: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Branch Operations</div>
          <h1>Staff & Team Setup</h1>
          <p>Manage access for your local branch workers and volunteers.</p>
        </div>
        <div className="header-actions">
          <Button
            className="btn-premium"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={18} /> <span>Add User</span>
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <Card
          className="stat-card glass-morphism"
          style={{ marginBottom: "24px" }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div
              className="search-input-wrapper"
              style={{ flex: 1, position: "relative" }}
            >
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-placeholder)",
                }}
              />
              <input
                type="text"
                className="input-premium"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="team-card-premium glass-morphism">
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Member
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.isLoading && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      <Loader2
                        size={20}
                        className="spinner"
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      Loading staff…
                    </td>
                  </tr>
                )}
                {usersQuery.isError && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--danger)",
                      }}
                    >
                      Could not load staff.
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading && !usersQuery.isError && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      {searchTerm
                        ? "No staff match your search."
                        : "No staff yet. Click Add User to get started."}
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "var(--blue-subtle)",
                            color: "var(--blue)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14px" }}>
                            {u.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-tertiary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={11} /> {u.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        className="header-badge"
                        style={{
                          margin: 0,
                          background: "var(--bg-main)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {u.role === "location_admin"
                          ? "Location Admin"
                          : "Worker"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deleteUser.isPending}
                        aria-label={`Remove ${u.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Add User"
      >
        <form onSubmit={handleCreate} className="wizard-container">
          <div className="wizard-step-content fade-in">
            <p className="wizard-hint">
              Create a new staff account for this branch. They&apos;ll be able to
              sign in with their phone number.
            </p>
            <div className="form-stack">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
                autoFocus
              />
              <Input
                label="Phone Number"
                placeholder="+12345678901"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required
              />
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="branch-user-role">
                  Role
                </label>
                <select
                  id="branch-user-role"
                  className="input-field select-field"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as AdminUserRole)
                  }
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className="wizard-actions"
              style={{ marginTop: "24px" }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSaving}
              >
                <X size={16} style={{ marginRight: "6px" }} />
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && (
                  <Loader2
                    size={16}
                    className="spinner"
                    style={{ marginRight: "6px" }}
                  />
                )}
                {isSaving ? "Creating…" : "Create User"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="User created"
        description="The new user can now sign in with their phone number."
        primaryAction={{
          label: "Okay",
          onClick: () => setShowSuccess(false),
        }}
        icon="shield"
      />
    </div>
  );
}
