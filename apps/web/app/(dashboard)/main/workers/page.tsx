"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useUsersList } from "@/services/users";
import { useLocationsList } from "@/services/manage-organization";
import {
  useStartResetMemberPin,
  useVerifyResetMemberPin,
} from "@/services/manage-organization";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "../main.css";

export default function HQWorkersPage() {
  const router = useRouter();
  const usersQuery = useUsersList();
  const locationsQuery = useLocationsList();
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [pinResetFor, setPinResetFor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const locations = locationsQuery.data?.data ?? [];
  const users = usersQuery.data ?? [];
  const workers = users.filter(
    (u) => u.role === "worker" || u.role === "location_admin",
  );
  const filtered = workers.filter((w) => {
    if (branchFilter !== "all" && w.branch_id !== branchFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.phone.includes(searchTerm);
  });

  const locationName = (id?: string) =>
    locations.find((l) => l.id === id)?.name ?? "—";

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div>
          <h1>Organization Workers</h1>
          <p>
            Manage and view performance of workers across all locations.
          </p>
        </div>
        <Button variant="primary">Export Worker Data</Button>
      </div>

      <Card
        className="filter-card"
        style={{ marginBottom: "20px", padding: "20px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <Input
            label="Search Worker"
            placeholder="Name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="input-wrapper">
            <label className="input-label">Filter by Location</label>
            <select
              className="input-field select-field"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              disabled={locationsQuery.isLoading}
            >
              <option value="all">All Branches</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Role</th>
                <th>Invites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
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
                    Loading workers…
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td
                    colSpan={6}
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
                      colSpan={6}
                      style={{ textAlign: "center", padding: "32px" }}
                    >
                      {searchTerm || branchFilter !== "all"
                        ? "No workers match your filters."
                        : "No workers yet."}
                    </td>
                  </tr>
                )}
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td data-label="Worker Name">
                    <div className="worker-name">{w.name}</div>
                  </td>
                  <td data-label="Phone" className="monospace">
                    {w.phone}
                  </td>
                  <td data-label="Location">{locationName(w.branch_id)}</td>
                  <td data-label="Role">
                    <span className={`role-badge role-${w.role}`}>
                      {w.role === "location_admin"
                        ? "Location Admin"
                        : "Worker"}
                    </span>
                  </td>
                  <td data-label="Invites">{w.invites_count}</td>
                  <td data-label="Actions">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/main/workers/invites?id=${w.id}&name=${encodeURIComponent(w.name)}`,
                          )
                        }
                      >
                        View Invites
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPinResetFor({ id: w.id, name: w.name })
                        }
                      >
                        Reset PIN
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pinResetFor && (
        <PinResetModal
          workerId={pinResetFor.id}
          workerName={pinResetFor.name}
          onClose={() => setPinResetFor(null)}
        />
      )}
    </div>
  );
}

function PinResetModal({
  workerId,
  workerName,
  onClose,
}: {
  workerId: string;
  workerName: string;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [step, setStep] = useState<"otp" | "done">("otp");
  const start = useStartResetMemberPin();
  const verify = useVerifyResetMemberPin();
  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = start.isPending || verify.isPending;

  const handleStart = async () => {
    try {
      await start.mutateAsync(workerId);
      toast.success(`OTP sent to ${workerName}'s phone.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not start PIN reset."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();
    if (otp.length < 4) {
      setError("otp", "Enter the OTP code.");
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setError("newPin", "PIN must be 4 to 6 digits.");
      return;
    }
    try {
      await verify.mutateAsync({
        memberId: workerId,
        input: { otp, pin: newPin },
      });
      toast.success(`PIN reset for ${workerName}.`);
      setStep("done");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not reset PIN."));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Reset PIN for ${workerName}`}>
      {step === "otp" && (
        <form onSubmit={handleSubmit} className="form-stack-premium">
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Send an OTP to {workerName}&apos;s registered phone number, then
            enter the OTP and a new PIN below.
          </p>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleStart}
            disabled={isSaving}
          >
            {isSaving && (
              <Loader2
                size={16}
                className="spinner"
                style={{ marginRight: "8px" }}
              />
            )}
            {start.isPending ? "Sending OTP…" : "Send OTP"}
          </Button>
          <Input
            label="OTP Code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            error={errors.otp}
            required
          />
          <Input
            label="New PIN"
            type="password"
            placeholder="4-6 digits"
            value={newPin}
            onChange={(e) =>
              setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            error={errors.newPin}
            required
          />
          <Button
            type="submit"
            className="btn-premium"
            fullWidth
            size="lg"
            disabled={isSaving}
          >
            {verify.isPending && (
              <Loader2
                size={16}
                className="spinner"
                style={{ marginRight: "8px" }}
              />
            )}
            Reset PIN
          </Button>
        </form>
      )}
      {step === "done" && (
        <div className="form-stack-premium">
          <p style={{ color: "var(--success)", fontSize: "14px" }}>
            PIN reset successfully. {workerName} can now sign in with the new
            PIN.
          </p>
          <Button
            className="btn-premium"
            fullWidth
            size="lg"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
