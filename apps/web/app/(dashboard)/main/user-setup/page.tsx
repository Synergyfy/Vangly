"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
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
import { useLocationsList } from "@/services/manage-organization";
import type { AdminUserRole } from "@/types/api/users";
import {
  UserPlus,
  Search,
  Loader2,
  Trash2,
  X,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import "../main.css";

const ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: "worker", label: "Worker" },
  { value: "location_admin", label: "Location Admin" },
  { value: "organization_admin", label: "Organization Admin" },
];

export default function UserSetupPage() {
  const { user } = useAuth();
  const usersQuery = useUsersList();
  const locationsQuery = useLocationsList();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminUserRole>("worker");
  const [branchId, setBranchId] = useState<string>(
    user?.branch_id ?? "",
  );

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = createUser.isPending;

  const users = usersQuery.data ?? [];
  const locations = locationsQuery.data?.data ?? [];
  const filtered = users.filter((u) =>
    searchTerm
      ? `${u.name} ${u.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setRole("worker");
    setBranchId(user?.branch_id ?? "");
    clearAll();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 250);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

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
    if (!branchId) {
      setError("branchId", "Please select a location.");
      return;
    }

    try {
      await createUser.mutateAsync({
        name: name.trim(),
        phone,
        role,
        branch_id: branchId,
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
          <div className="header-badge">User Operations</div>
          <h1>Staff & Users</h1>
          <p>
            Configure access for Location Admins and Organization Workers across
            your network.
          </p>
        </div>
        <div
          className="header-actions"
          style={{ display: "flex", gap: "12px" }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/main/invitees")}
            className="back-btn-pill"
          >
            <LinkIcon size={18} /> <span>Invite Links</span>
          </Button>
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
                placeholder="Search users by name or phone..."
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
                    }}
                  >
                    Location
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
                      colSpan={4}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      <Loader2
                        size={20}
                        className="spinner"
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      Loading users…
                    </td>
                  </tr>
                )}
                {usersQuery.isError && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--danger)",
                      }}
                    >
                      Could not load users.
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading && !usersQuery.isError && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      {searchTerm
                        ? "No users match your search."
                        : "No users yet. Click Add User to get started."}
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
                          : u.role === "organization_admin"
                            ? "Organization Admin"
                            : "Worker"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px" }}>
                      {u.branch_id ?? "—"}
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
              Create a new staff or admin account. They&apos;ll be able to sign in
              with their phone number.
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
                <label className="input-label" htmlFor="add-user-role">
                  Role
                </label>
                <select
                  id="add-user-role"
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
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="add-user-branch">
                  Location
                </label>
                <select
                  id="add-user-branch"
                  className="input-field select-field"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={locationsQuery.isLoading}
                >
                  <option value="">
                    {locationsQuery.isLoading
                      ? "Loading locations…"
                      : "Select a location"}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <span className="input-error">{errors.branchId}</span>
                )}
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
