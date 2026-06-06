"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Building2,
  MapPin,
  ArrowLeft,
  Image as ImageIcon,
  HelpCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { useCreateLocation } from "@/services/manage-organization";
import { ApiError } from "@/lib/api/client";
import "../management.css";

const Tooltip = ({ content }: { content: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="tooltip-container">
      <button
        type="button"
        className="tooltip-trigger"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        aria-label="Help"
      >
        <HelpCircle size={14} />
      </button>
      {show ? (
        <div className="tooltip-popup">
          <div className="tooltip-content">{content}</div>
          <button className="tooltip-close" onClick={() => setShow(false)}>
            <X size={12} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

interface FormState {
  name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  description: string;
  photo_url: string;
}

const EMPTY: FormState = {
  name: "",
  city: "",
  state: "",
  country: "NG",
  address: "",
  description: "",
  photo_url: "",
};

const ISO_COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
];

export default function NewLocationPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const createLocation = useCreateLocation();
  const [success, setSuccess] = useState(false);

  const apiError =
    createLocation.error instanceof ApiError ? createLocation.error : null;
  const errorMessage =
    apiError?.body?.message ??
    (createLocation.error instanceof Error
      ? createLocation.error.message
      : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createLocation.isPending) return;
    createLocation.mutate(
      {
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        country: form.country.trim().toUpperCase(),
        address: form.address.trim() || undefined,
        description: form.description.trim() || undefined,
        photo_url: form.photo_url.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          window.setTimeout(
            () => router.push("/main/manage-organization"),
            1500,
          );
        },
      },
    );
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="back-btn-header"
        >
          <ArrowLeft size={18} /> Back to Network
        </Button>
        <h1 className="mobile-title">Create New Location</h1>
        <p className="mobile-subtitle">
          Establish a new physical location for your organization community.
        </p>
      </div>

      <div className="form-container-premium">
        {success ? (
          <Card className="success-full-card">
            <div className="success-icon-large">🎉</div>
            <h2>Location Established!</h2>
            <p>You have successfully added a new location to your network.</p>
            <p className="redirect-hint">
              Taking you back to your network overview...
            </p>
          </Card>
        ) : (
          <Card className="management-card-premium">
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-section">
                <div className="section-header">
                  <div className="header-title-row">
                    <Building2 size={20} className="text-primary" />
                    <h3>Basic Information</h3>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="input-group-premium">
                    <div
                      className="label-row"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <label style={{ margin: 0 }}>Location Name</label>
                      <Tooltip content="Choose a name that clearly identifies this site (e.g. Southpark Office)." />
                    </div>
                    <Input
                      placeholder="e.g. Southpark Satellite"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="input-group-premium">
                    <div
                      className="label-row"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <label style={{ margin: 0 }}>Location / City</label>
                      <Tooltip content="The city or district where this location is physically located." />
                    </div>
                    <Input
                      placeholder="e.g. Lagos, Nigeria"
                      icon={<MapPin size={16} />}
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      required
                      maxLength={100}
                    />
                  </div>
                </div>
                <div
                  className="form-grid"
                  style={{ marginTop: 20 }}
                >
                  <div className="input-group-premium">
                    <div
                      className="label-row"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <label style={{ margin: 0 }}>State / Region</label>
                      <Tooltip content="State, region, or province (optional)." />
                    </div>
                    <Input
                      placeholder="e.g. Lagos"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      maxLength={100}
                    />
                  </div>
                  <div className="input-group-premium">
                    <div
                      className="label-row"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <label style={{ margin: 0 }}>Country</label>
                      <Tooltip content="ISO 3166-1 alpha-2 country code (e.g. NG, US, GB)." />
                    </div>
                    <select
                      className="input-field"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid var(--border-main)",
                        borderRadius: 12,
                        fontSize: 14,
                        background: "white",
                      }}
                    >
                      {ISO_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  className="input-group-premium input-full"
                  style={{ marginTop: 20 }}
                >
                  <div
                    className="label-row"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <label style={{ margin: 0 }}>Street Address</label>
                    <Tooltip content="Optional street address for this location." />
                  </div>
                  <Input
                    placeholder="e.g. 12 Redemption Way"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    maxLength={500}
                  />
                </div>
                <div
                  className="input-group-premium input-full"
                  style={{ marginTop: 20 }}
                >
                  <div
                    className="label-row"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <label style={{ margin: 0 }}>Short Description</label>
                    <Tooltip content="A 2-3 sentence overview of this location's focus or purpose." />
                  </div>
                  <textarea
                    className="input-field textarea-field"
                    rows={3}
                    placeholder="Briefly describe this location's community or focus..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <div
                    className="header-title-row"
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <ImageIcon size={20} className="text-primary" />
                    <h3 style={{ margin: 0 }}>Location Photo URL</h3>
                    <Tooltip content="Upload a high-quality photo to help members identify the site. Direct CDN uploads are wired up separately — paste a URL here for now." />
                  </div>
                </div>
                <div
                  className="upload-placeholder-zone-premium"
                  style={{ flexDirection: "column", alignItems: "stretch", padding: 20 }}
                >
                  <Input
                    placeholder="https://cdn.vangly.app/…/photo.webp"
                    value={form.photo_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, photo_url: e.target.value }))
                    }
                    maxLength={2000}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      marginTop: 8,
                    }}
                  >
                    Paste a CDN URL (≤ 2 000 chars). The upload widget is
                    wired up to the CDN in a follow-up — see the
                    manage-organization dev doc §5 for the photo flow.
                  </p>
                </div>
              </div>

              {errorMessage ? (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: "var(--red-subtle, #fef2f2)",
                    border: "1px solid var(--red, #ef4444)",
                    borderRadius: 12,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertCircle
                    size={18}
                    color="var(--red, #ef4444)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div>
                    <strong style={{ color: "var(--red, #b91c1c)" }}>
                      Couldn’t create location
                    </strong>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                      }}
                    >
                      {errorMessage}
                    </p>
                  </div>
                </div>
              ) : null}

              <div
                className="form-actions-footer-premium"
                style={{
                  marginTop: 32,
                  display: "flex",
                  gap: 16,
                  flexDirection: "row-reverse",
                }}
              >
                <Button
                  type="submit"
                  disabled={createLocation.isPending}
                  style={{ flex: 2 }}
                >
                  {createLocation.isPending
                    ? "Establishing..."
                    : "Create Location"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={createLocation.isPending}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
