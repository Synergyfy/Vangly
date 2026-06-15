"use client";

import React, { useState, useRef } from "react";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Users,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { getPublicForm } from "@/lib/api/endpoints/public-forms";
import {
  useTrackPublicScan,
  useSubmitPublicForm,
} from "@/services/manage-organization";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import type { FormField } from "@/types/api/teams";
import "../first-timer.css";

export default function FirstTimerPage({
  params,
}: {
  params: Promise<{ unique_code: string }>;
}) {
  const { unique_code } = use(params);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const searchParams = useSearchParams();
  const workerNameParam = searchParams.get("worker_name") ?? "";
  const workerIdParam = searchParams.get("worker_id") ?? "";
  const locationIdParam = searchParams.get("location_id") ?? "";
  const locationNameParam = searchParams.get("location_name") ?? "";

  // Editable overrides — seeded once from URL params, then freely editable
  const [workerName, setWorkerName] = useState(workerNameParam);
  const [workerId, setWorkerId] = useState(workerIdParam);
  const [locationName, setLocationName] = useState(locationNameParam);

  const { errors, setError, clearAll } = useFieldErrors();

  const formQuery = useQuery({
    queryKey: ["public-form", unique_code],
    queryFn: () => getPublicForm(unique_code),
    enabled: Boolean(unique_code),
  });

  // Seed locationName from form data the first time it arrives (if not set via URL)
  const locationSeeded = useRef(false);
  if (!locationSeeded.current && formQuery.data?.location_name && !locationNameParam && !locationName) {
    locationSeeded.current = true;
    // setState during render is safe in React when guarded by a ref flag
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setLocationName(formQuery.data.location_name);
  }

  const trackScan = useTrackPublicScan();
  const submitForm = useSubmitPublicForm();

  // Fire-and-forget scan track on mount (run once via ref guard)
  const scanFired = useRef(false);
  if (unique_code && !scanFired.current) {
    scanFired.current = true;
    trackScan.mutate({ publicId: unique_code, input: {} });
  }

  const handleWorkerNameChange = (val: string) => {
    setWorkerName(val);
    if (val !== workerNameParam) {
      setWorkerId("");
    }
  };

  const formData = formQuery.data;

  const setFieldValue = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (fields: FormField[]): boolean => {
    clearAll();
    let hasError = false;
    for (const field of fields) {
      if (field.required && !answers[field.key]?.trim()) {
        setError(field.key, `${field.label} is required.`);
        hasError = true;
      }
      if (field.type === "email" && answers[field.key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[field.key])) {
          setError(field.key, "Enter a valid email address.");
          hasError = true;
        }
      }
      if (field.type === "phone" && answers[field.key]) {
        const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
        if (!phoneRegex.test(answers[field.key])) {
          setError(field.key, "Enter a valid phone number.");
          hasError = true;
        }
      }
    }
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!validate(formData.fields)) return;

    try {
      const result = await submitForm.mutateAsync({
        publicId: unique_code,
        input: {
          answers: answers as Record<string, unknown>,
          scan_token: trackScan.data?.scan_token,
          worker_id: workerId || undefined,
          worker_name: workerName.trim() || undefined,
          location_id: locationIdParam || undefined,
          location_name: locationName.trim() || undefined,
        },
      });
      setSuccessMessage(
        result.message ?? "Your information has been submitted successfully.",
      );
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not submit form."));
    }
  };

  const workerDisplayName = unique_code
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (formQuery.isLoading) {
    return (
      <div className="first-timer-container">
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--text-tertiary)",
          }}
        >
          <Loader2
            size={32}
            className="spinner"
            style={{ display: "inline", verticalAlign: "middle" }}
          />{" "}
          Loading…
        </div>
      </div>
    );
  }

  if (formQuery.isError) {
    return (
      <div className="first-timer-container">
        <Card className="first-timer-card" style={{ textAlign: "center", padding: "32px" }}>
          <h2>Form Not Found</h2>
          <p style={{ color: "var(--text-tertiary)", marginTop: "8px" }}>
            {extractErrorMessage(
              formQuery.error,
              "This form could not be found or has expired.",
            )}
          </p>
        </Card>
      </div>
    );
  }

  const primaryColor = formData?.primary_color ?? "var(--blue)";

  return (
    <div className="first-timer-container">
      <div className="first-timer-header">
        <div className="organization-logo-wrapper">
          <Sparkles size={40} style={{ color: primaryColor }} />
        </div>
        <h1>{formData?.title || "Welcome Home"}</h1>
        {formData?.description ? (
          <p>{formData.description}</p>
        ) : (
          <p>We&apos;re so glad you&apos;re here with us today.</p>
        )}
      </div>

      <Card className="first-timer-card glass">
        <div className="guest-info-pill">
          <Users size={18} style={{ color: primaryColor }} />
          <span>
            {workerName ? `Joining as a guest of ${workerName}` : `Welcome to ${formData?.organization_name || "Harvite"}`}
            {locationName && ` (${locationName})`}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          {(formData?.fields ?? []).map((field: FormField) => (
            <Input
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "phone"
                    ? "tel"
                    : field.type === "number"
                      ? "number"
                      : "text"
              }
              value={answers[field.key] ?? ""}
              onChange={(e) => setFieldValue(field.key, e.target.value)}
              error={errors[field.key]}
              required={field.required}
            />
          ))}

          {(!formData?.fields || formData.fields.length === 0) && (
            <>
              <Input
                label="What&apos;s your name?"
                placeholder="e.g. John Doe"
                value={answers.name ?? ""}
                onChange={(e) => setFieldValue("name", e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+234..."
                type="tel"
                value={answers.phone ?? ""}
                onChange={(e) => setFieldValue("phone", e.target.value)}
                required
              />
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Outreach Details
            </h3>
            <Input
              label="Invited by"
              placeholder="Who invited you?"
              value={workerName}
              onChange={(e) => handleWorkerNameChange(e.target.value)}
            />
            <Input
              label="Campus / Branch"
              placeholder="Which branch are you joining?"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          <div className="form-submit">
            <Button
              type="submit"
              fullWidth
              className="btn-welcome"
              disabled={submitForm.isPending}
              style={
                primaryColor !== "var(--blue)"
                  ? { background: primaryColor }
                  : undefined
              }
            >
              {submitForm.isPending ? "Submitting..." : "Check In"}
            </Button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              marginTop: "0.5rem",
            }}
          >
            By checking in, you agree to receive a warm welcome message from
            our team.
          </p>
        </form>
      </Card>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="check"
        title="Welcome Home!"
        description={successMessage}
        primaryAction={{
          label: "Close",
          onClick: () => setShowSuccess(false),
        }}
      />
    </div>
  );
}
