"use client";

import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useBrand } from "@/contexts/BrandContext";
import {
  Palette,
  Upload,
  Check,
  Save,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import "./brand.css";

export default function BrandIdentityPage() {
  const { settings, updateSettings } = useBrand();
  const [churchName, setChurchName] = useState(settings.churchName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.logoUrl,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulate API save
    setTimeout(() => {
      updateSettings({
        churchName,
        primaryColor,
        accentColor,
        logoUrl: logoPreview,
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <h1>Brand Identity</h1>
        <p>Customize how your church appears to workers and guests.</p>
      </div>

      <div className="brand-grid">
        <div className="brand-config">
          <Card className="brand-card">
            <div className="card-section">
              <h2 className="section-title">
                <ImageIcon size={18} /> Church Logo
              </h2>
              <div className="logo-upload-area">
                <div className="logo-preview-box">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Church Logo"
                      className="logo-preview-img"
                    />
                  ) : (
                    <div className="logo-placeholder">
                      <ImageIcon size={40} />
                    </div>
                  )}
                </div>
                <div className="logo-upload-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} style={{ marginRight: "8px" }} /> Upload
                    New Logo
                  </Button>
                  <p className="upload-hint">
                    Recommended: Square PNG with transparent background.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-section">
              <h2 className="section-title">
                <Palette size={18} /> Visual Identity
              </h2>
              <div className="form-row">
                <Input
                  label="Church Name"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="Enter church name..."
                />
              </div>
              <div className="color-picker-grid">
                <div className="color-input-wrapper">
                  <label className="input-label">Primary Brand Color</label>
                  <div className="color-picker-input">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="color-dot"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="color-hex"
                    />
                  </div>
                </div>
                <div className="color-input-wrapper">
                  <label className="input-label">Accent Color</label>
                  <div className="color-picker-input">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="color-dot"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="color-hex"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="save-btn"
              >
                {isSaving ? (
                  "Applying Changes..."
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {showSuccess ? <Check size={18} /> : <Save size={18} />}
                    {showSuccess
                      ? "Saved Successfully!"
                      : "Save Brand Settings"}
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="brand-preview">
          <h3>Live Preview</h3>
          <div className="preview-scroll-wrapper">
            <button
              className="preview-scroll-btn left"
              onClick={() => {
                const el = document.getElementById("brand-preview-scroll");
                if (el) el.scrollBy({ left: -200, behavior: "smooth" });
              }}
            >
              <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
            </button>

            <div
              className="preview-container"
              id="brand-preview-scroll"
              style={
                {
                  "--preview-primary": primaryColor,
                  "--preview-accent": accentColor,
                } as any
              }
            >
              <Card className="preview-sample-card">
                <div className="preview-topbar">
                  <div className="preview-logo-tiny">
                    {logoPreview ? <img src={logoPreview} alt="" /> : "⛪"}
                  </div>
                  <div className="preview-name-tiny">
                    {churchName || "Your Church"}
                  </div>
                </div>
                <div className="preview-content-sample">
                  <div className="preview-btn-sample">Primary Button</div>
                  <div className="preview-stats-sample">
                    <div className="stat-blob">142</div>
                    <div className="stat-blob accent">28%</div>
                  </div>
                </div>
              </Card>

              <Card className="preview-qr-sample">
                <div className="qr-box-sample">
                  <div className="qr-pattern">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="qr-dot" />
                    ))}
                  </div>
                  <div className="qr-logo-overlay">
                    {logoPreview ? <img src={logoPreview} alt="" /> : "⛪"}
                  </div>
                </div>
                <p>QR Code Center Logo Preview</p>
              </Card>
            </div>

            <button
              className="preview-scroll-btn right"
              onClick={() => {
                const el = document.getElementById("brand-preview-scroll");
                if (el) el.scrollBy({ left: 200, behavior: "smooth" });
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
