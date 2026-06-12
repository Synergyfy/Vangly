"use client";

import React, { useState, useRef, type ChangeEvent } from "react";
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
  Upload,
  Trash2,
} from "lucide-react";
import { useCreateLocation } from "@/services/manage-organization";
import { ApiError } from "@/lib/api/client";
import "../management.css";

function isValidPhotoUrl(value: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "URL must use http or https.";
    }
    return null;
  } catch {
    return "Enter a valid URL (e.g. https://cdn.vangly.app/...).";
  }
}

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrlError, setPhotoUrlError] = useState<string | null>(null);
  const createLocation = useCreateLocation();
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiError =
    createLocation.error instanceof ApiError ? createLocation.error : null;
  const errorMessage =
    apiError?.body?.message ??
    (createLocation.error instanceof Error
      ? createLocation.error.message
      : null);

  const handlePhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setPhotoUrlError(null);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setForm((f) => ({ ...f, photo_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoUrlChange = (value: string) => {
    setForm((f) => ({ ...f, photo_url: value }));
    if (value) {
      setPhotoUrlError(isValidPhotoUrl(value));
    } else {
      setPhotoUrlError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createLocation.isPending) return;

    const urlErr = isValidPhotoUrl(form.photo_url.trim());
    if (urlErr) {
      setPhotoUrlError(urlErr);
      return;
    }

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
          <ArrowLeft size={18} /> Back
        </Button>
        <h1 className="mobile-title">Create New Location</h1>
        <p className="mobile-subtitle">
          Establish a new location for your organization.
        </p>
      </div>

      <div className="form-container-premium">
        {success ? (
          <Card className="success-full-card">
            <div className="success-icon-large">🎉</div>
            <h2>Location Established!</h2>
            <p>Successfully added a new location to your network.</p>
            <p className="redirect-hint">
              Redirecting to your network overview...
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
                    <div className="label-row">
                      <label>Location Name</label>
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
                    <div className="label-row">
                      <label>City</label>
                      <Tooltip content="The city or district where this location is physically located." />
                    </div>
                    <Input
                      placeholder="e.g. Lagos"
                      icon={<MapPin size={16} />}
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="input-group-premium">
                    <div className="label-row">
                      <label>State / Region</label>
                      <Tooltip content="State, region, or province (optional)." />
                    </div>
                    <Input
                      placeholder="e.g. Lagos State"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      maxLength={100}
                    />
                  </div>
                  <div className="input-group-premium">
                    <div className="label-row">
                      <label>Country</label>
                      <Tooltip content="ISO 3166-1 alpha-2 country code (e.g. NG, US, GB)." />
                    </div>
                    <select
                      className="input-field"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                      required
                    >
                      {ISO_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group-premium input-full">
                  <div className="label-row">
                    <label>Street Address</label>
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
                <div className="input-group-premium input-full">
                  <div className="label-row">
                    <label>Short Description</label>
                    <Tooltip content="A 2-3 sentence overview of this location's focus or purpose." />
                  </div>
                  <textarea
                    className="textarea-field"
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
                  <div className="header-title-row">
                    <ImageIcon size={20} className="text-primary" />
                    <h3>Location Photo</h3>
                    <Tooltip content="Upload an image or paste a CDN URL." />
                  </div>
                </div>
                <div className="upload-placeholder-zone-premium">
                  {photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="photo-preview-img"
                      />
                      <button
                        type="button"
                        className="photo-preview-remove"
                        onClick={handleRemovePhoto}
                        aria-label="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="photo-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                      <span>Choose Image</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handlePhotoFile}
                    style={{ display: "none" }}
                  />
                  <div className="photo-url-input-group">
                    <Input
                      placeholder="https://cdn.vangly.app/…/photo.webp"
                      value={form.photo_url}
                      onChange={(e) => handlePhotoUrlChange(e.target.value)}
                      maxLength={2000}
                    />
                    {photoUrlError && (
                      <span className="field-error">{photoUrlError}</span>
                    )}
                  </div>
                  <p>
                    Select an image or paste a CDN URL (max 2,000 characters).
                  </p>
                </div>
              </div>

              {errorMessage ? (
                <div className="error-banner-premium">
                  <AlertCircle size={18} color="#ef4444" className="error-icon" />
                  <div>
                    <strong>Couldn&apos;t create location</strong>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              ) : null}

              <div className="form-actions-footer-premium">
                <Button
                  type="submit"
                  disabled={createLocation.isPending}
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
