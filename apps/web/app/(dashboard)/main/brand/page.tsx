"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useBrand } from "@/contexts/BrandContext";
import {
  useMyOrganization,
  useUpdateMyOrganization,
} from "@/services/organizations";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { isHexColor } from "@/lib/forms/validators";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import { toast } from "sonner";
import {
  Palette,
  Upload,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import "./brand-identity.css";

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export default function BrandIdentityPage() {
  const { settings, updateSettings } = useBrand();
  const orgQuery = useMyOrganization();
  const updateOrg = useUpdateMyOrganization();

  const [organizationName, setOrganizationName] = useState(settings.organizationName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = updateOrg.isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (orgQuery.data) {
      if (orgQuery.data.name) setOrganizationName(orgQuery.data.name);
      if (orgQuery.data.primary_color) setPrimaryColor(orgQuery.data.primary_color);
      if (orgQuery.data.logo_url) setLogoPreview(orgQuery.data.logo_url);
    }
  }, [orgQuery.data]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (!file) {
      setLogoPreview(orgQuery.data?.logo_url ?? settings.logoUrl ?? null);
      return;
    }
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Use a PNG, JPG, SVG, or WebP image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    clearAll();
    if (!organizationName.trim()) {
      setError("organizationName", "Organization name is required.");
      return;
    }
    if (!isHexColor(primaryColor)) {
      setError("primaryColor", "Use a valid hex color, e.g. #007AFF.");
      return;
    }

    try {
      const updated = await updateOrg.mutateAsync({
        name: organizationName.trim(),
        primary_color: primaryColor,
        logo_url: logoPreview ?? undefined,
      });
      updateSettings({
        organizationName: updated.name,
        primaryColor: updated.primary_color ?? primaryColor,
        logoUrl: updated.logo_url ?? logoPreview,
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save your brand."));
    }
  };

  return (
    <div className="brand-page-container hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Visual Identity</div>
          <h1>Brand Identity</h1>
          <p>Customize your organization look across the entire platform.</p>
        </div>
      </header>

      <div className="tab-switcher-premium lg:hidden" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Live Preview
        </button>
      </div>

      <div className="brand-modern-layout">
        <div className={`brand-config-side ${activeTab === 'config' ? 'active' : 'hidden lg:block'}`}>
          <Card className="brand-config-card-premium">
            <div className="config-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <ImageIcon size={20} className="text-blue" />
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Organization Logo</h3>
              </div>

              <div className="logo-upload-premium">
                <div className="logo-preview-box-large">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" />
                  ) : (
                    <ImageIcon size={48} color="var(--text-tertiary)" />
                  )}
                </div>
                <div className="upload-controls-premium">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept={ACCEPTED_LOGO_TYPES.join(",")}
                    style={{ display: 'none' }}
                    disabled={isSaving}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                  >
                    <Upload size={16} style={{ marginRight: '8px' }} /> Change Logo
                  </Button>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', lineHeight: '1.4' }}>
                    Square PNG or SVG works best. Max 2MB.
                  </p>
                  {logoError && (
                    <p style={{ fontSize: '11px', color: '#B42318', marginTop: '6px' }}>
                      {logoError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="config-divider" />

            <div className="config-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Palette size={20} className="text-purple" />
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Color Palette</h3>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Input
                  label="Organization Name"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    if (errors['organizationName']) clearAll();
                  }}
                  error={errors['organizationName']}
                  disabled={isSaving}
                />
              </div>

              <div className="color-inputs-stack">
                <div className="color-field-premium">
                  <label>Primary Color</label>
                  <div className="color-picker-strip">
                    <div className="color-swatch" style={{ background: primaryColor }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          if (errors['primaryColor']) clearAll();
                        }}
                        disabled={isSaving}
                      />
                    </div>
                    <input
                      type="text"
                      className="hex-input"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        if (errors['primaryColor']) clearAll();
                      }}
                      disabled={isSaving}
                    />
                  </div>
                  {errors['primaryColor'] && (
                    <p className="input-error-text" style={{ marginTop: '4px' }}>
                      {errors['primaryColor']}
                    </p>
                  )}
                </div>

                <div className="color-field-premium">
                  <label>Accent Color</label>
                  <div className="color-picker-strip">
                    <div className="color-swatch" style={{ background: accentColor }}>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                    <input
                      type="text"
                      className="hex-input"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="config-footer-premium">
              <Button
                className="btn-premium"
                fullWidth
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={20} style={{ marginRight: '8px' }} />
                {isSaving ? "Updating Brand..." : "Save Identity"}
              </Button>
            </div>
          </Card>
        </div>

        <div className={`brand-preview-side ${activeTab === 'preview' ? 'active' : 'hidden lg:block'}`}>
          <div className="preview-sticky-wrap">
            <h3 className="preview-label">Device Preview</h3>
            <div className="iphone-preview-wrap">
              <div className="iphone-frame-premium">
                <div className="iphone-screen-premium">
                  <div
                    className="app-mockup"
                    style={{ '--brand-p': primaryColor, '--brand-a': accentColor } as React.CSSProperties}
                  >
                    <div className="mock-header">
                      <div className="mock-logo-box">
                        {logoPreview ? <img src={logoPreview} alt="" /> : "V"}
                      </div>
                      <span className="mock-org-name">{organizationName || "Your Organization"}</span>
                    </div>
                    <div className="mock-body">
                      <div className="mock-card">
                        <div className="mock-stat-flex">
                          <div className="mock-stat-item">
                            <span className="m-val">1.2k</span>
                            <span className="m-lab">Invites</span>
                          </div>
                          <div className="mock-stat-item accent">
                            <span className="m-val">34%</span>
                            <span className="m-lab">Success</span>
                          </div>
                        </div>
                        <div className="mock-btn-primary">Register New Guest</div>
                      </div>

                      <div className="mock-qr-preview">
                        <div className="mock-qr-inner">
                          <div className="m-qr-pattern" />
                          <div className="m-qr-logo">
                            {logoPreview ? <img src={logoPreview} alt="" /> : "V"}
                          </div>
                        </div>
                        <p>QR Code Distribution</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="check"
        title="Brand Saved"
        description="Your organization brand is now live across the platform."
        primaryAction={{
          label: "View Live Preview",
          onClick: () => {
            setShowSuccess(false);
            setActiveTab('preview');
          },
        }}
        secondaryAction={{ label: "Done" }}
      />
    </div>
  );
}
