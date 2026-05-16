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

export default function BranchBrandIdentityPage() {
  const { settings, updateSettings } = useBrand();
  const [organizationName, setOrganizationName] = useState(settings.organizationName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings({ organizationName, primaryColor, accentColor, logoUrl: logoPreview });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Location Identity</div>
          <h1>Branch Branding</h1>
          <p>Customize how this location appears to users and invitees.</p>
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
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Branch Logo</h3>
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
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                    <Button variant="outline" size="sm" fullWidth onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} style={{ marginRight: '8px' }} /> Change Logo
                    </Button>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', lineHeight: '1.4' }}>
                      Square PNG or SVG works best. Max 2MB.
                    </p>
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
                    label="Branch Display Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>

                <div className="color-inputs-stack">
                   <div className="color-field-premium">
                      <label>Primary Color</label>
                      <div className="color-picker-strip">
                         <div className="color-swatch" style={{ background: primaryColor }}>
                            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                         </div>
                         <input type="text" className="hex-input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                      </div>
                   </div>

                   <div className="color-field-premium">
                      <label>Accent Color</label>
                      <div className="color-picker-strip">
                         <div className="color-swatch" style={{ background: accentColor }}>
                            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                         </div>
                         <input type="text" className="hex-input" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="config-footer-premium">
                <Button className="btn-premium" fullWidth size="lg" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Updating Brand..." : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {showSuccess ? <Check size={20} /> : <Save size={20} />}
                      {showSuccess ? "Changes Saved!" : "Save Identity"}
                    </div>
                  )}
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
                       <div className="app-mockup" style={{ '--brand-p': primaryColor, '--brand-a': accentColor } as any}>
                          <div className="mock-header">
                             <div className="mock-logo-box">
                                {logoPreview ? <img src={logoPreview} alt="" /> : "V"}
                             </div>
                             <span className="mock-org-name">{organizationName || "Your Branch"}</span>
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
    </div>
  );
}
