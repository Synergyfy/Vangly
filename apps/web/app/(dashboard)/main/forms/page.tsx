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
  Eye,
  Users,
  ArrowLeft,
  Layout,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  AtSign,
  Smartphone,
  CheckSquare,
  Circle,
  List,
  Calendar,
  Clock,
  FileUp,
  Image as ImageIcon,
  PenTool,
  Star,
  Link as LinkIcon,
  MapPin,
  Minus,
  Layers,
  Trash,
  ShieldCheck,
  Share,
  LogIn,
  Smartphone as PhoneIcon,
  Monitor,
  Filter,
  BarChart3,
  Building2,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { useLocationsList } from "@/services/manage-organization";
import { SuccessModal } from "@/components/ui/SuccessModal";
import type {
  FormField,
  FormDistribution,
  FormFieldType,
} from "@/types/api/teams";
import "../main.css";
import "../management.css";

export default function FormsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form Builder State
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop" | null>(
    null,
  );
  const [formConfig, setFormConfig] = useState({
    title: "",
    description: "",
    status: "draft" as "draft" | "published",
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = useState(false);
  const locationsQuery = useLocationsList({ per_page: 100 });

  const locations = locationsQuery.data?.data ?? [];

  const [formDistribution, setFormDistribution] = useState<FormDistribution>({
    mode: "public",
    frequency: "all",
  });

  const fieldTypes = [
    {
      id: "text",
      label: "Short Text",
      icon: Type,
      cat: "Standard",
      desc: "Single line of text.",
    },
    {
      id: "longtext",
      label: "Long Text",
      icon: AlignLeft,
      cat: "Standard",
      desc: "Multiple lines for longer answers.",
    },
    { id: "number", label: "Number", icon: Hash, cat: "Standard", desc: "Numeric input only." },
    {
      id: "email",
      label: "Email",
      icon: AtSign,
      cat: "Standard",
      desc: "Email address validation.",
    },
    {
      id: "phone",
      label: "Phone",
      icon: Smartphone,
      cat: "Standard",
      desc: "International phone format.",
    },
    {
      id: "url",
      label: "Website URL",
      icon: LinkIcon,
      cat: "Standard",
      desc: "Valid URL address.",
    },
    {
      id: "checkbox",
      label: "Checkbox",
      icon: CheckSquare,
      cat: "Choice",
      desc: "Select multiple options.",
    },
    {
      id: "radio",
      label: "Radio Choice",
      icon: Circle,
      cat: "Choice",
      desc: "Select exactly one option.",
    },
    {
      id: "dropdown",
      label: "Dropdown",
      icon: List,
      cat: "Choice",
      desc: "Choose from a compact list.",
    },
    { id: "date", label: "Date", icon: Calendar, cat: "Date & Time", desc: "Pick a specific calendar date." },
    { id: "time", label: "Time", icon: Clock, cat: "Date & Time", desc: "Select a specific time." },
    {
      id: "fileupload",
      label: "File Upload",
      icon: FileUp,
      cat: "Media",
      desc: "Documents or generic files.",
    },
    {
      id: "image",
      label: "Image",
      icon: ImageIcon,
      cat: "Media",
      desc: "Photos or visual assets.",
    },
    {
      id: "signature",
      label: "Signature",
      icon: PenTool,
      cat: "Advanced",
      desc: "Digital signature capture.",
    },
    {
      id: "rating",
      label: "Rating",
      icon: Star,
      cat: "Advanced",
      desc: "Star or scale-based feedback.",
    },
    {
      id: "address",
      label: "Address",
      icon: MapPin,
      cat: "Advanced",
      desc: "Location or postal details.",
    },
    {
      id: "paragraph",
      label: "Paragraph Text",
      icon: Type,
      cat: "Layout",
      desc: "Display-only informational text.",
    },
    {
      id: "divider",
      label: "Divider",
      icon: Minus,
      cat: "Layout",
      desc: "Visual separation between fields.",
    },
  ];

  const fieldCounter = useRef(0);
  const addField = (typeId: string) => {
    fieldCounter.current += 1;
    const newField: FormField = {
      key: `f_${fieldCounter.current}`,
      label: "",
      type: typeId as FormFieldType,
      required: false,
      placeholder: "",
      help_text: "",
      options: [],
    };
    setFormFields([...formFields, newField]);
    setIsFieldSelectorOpen(false);
  };

  const updateField = (idx: number, patch: Partial<FormField>) => {
    setFormFields((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...patch };
      return updated;
    });
  };

  const handleCreateNew = () => {
    setEditingFormId(null);
    setFormConfig({ title: "", description: "", status: "draft" });
    setFormFields([]);
    setFormDistribution({ mode: "public", frequency: "all" });
    setIsFormBuilderOpen(true);
  };

  const handlePublishForm = () => {
    setIsDistributionModalOpen(false);
    setIsFormBuilderOpen(false);
    setIsPublishSuccessOpen(true);
  };

  const handleSaveDraft = () => {
    setIsDistributionModalOpen(false);
    setIsFormBuilderOpen(false);
    toast.success("Form saved as draft.");
  };

  return (
    <div className="hq-dashboard-premium hub-v2-container animate-premium">
      <div className="page-header flex-between responsive-header">
        <div className="header-main">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="back-btn-pill"
            style={{ marginBottom: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="header-badge">Data Capture Hub</div>
          <h1>Forms & Surveys</h1>
          <p>
            Collect high-impact data with custom outreach and feedback forms.
          </p>
        </div>
        <Button className="btn-premium" onClick={handleCreateNew}>
          <Plus size={18} /> <span>Create New Form</span>
        </Button>
      </div>

      <main className="dashboard-main-content">
        <Card className="filter-card-premium glass-morphism responsive-card">
          <div className="filter-grid-v2">
            <div className="premium-search-bar" style={{ flex: 1 }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search forms by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-actions-v2">
              <Button
                variant={showFilters ? "primary" : "outline"}
                className="filter-btn-v2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} /> <span>Filters</span>
              </Button>
              <Button
                variant={showStats ? "primary" : "outline"}
                className="filter-btn-v2"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 size={16} /> <span>Stats</span>
              </Button>
            </div>
          </div>
        </Card>

        <div className="forms-display-grid-premium">
          {locationsQuery.isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                gridColumn: "1 / -1",
                color: "var(--text-tertiary)",
              }}
            >
              <Loader2
                size={20}
                className="spinner"
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              Loading locations…
            </div>
          )}
          {locations.map((loc) => (
            <Card key={loc.id} className="form-manage-card-v2 animate-slide-up">
              <div className="form-card-main-info">
                <div className="form-icon-v2">
                  <Building2 size={24} />
                </div>
                <div className="form-text-details">
                  <div className="form-top-row">
                    <span className="form-type-pill">Location</span>
                    <span
                      className={`form-status-dot-pill ${loc.status.toLowerCase()}`}
                    >
                      <div className={`status-dot ${loc.status.toLowerCase()}`} />{" "}
                      {loc.status}
                    </span>
                  </div>
                  <h3>{loc.name}</h3>
                  <div className="form-meta-grid">
                    <div className="meta-item">
                      <Users size={14} />{" "}
                      <span>{loc.stats.members} workers</span>
                    </div>
                    <div className="meta-item">
                      <FileText size={14} />{" "}
                      <span>{loc.stats.teams} teams</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-card-v2-actions">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() =>
                    router.push(
                      `/main/manage-organization/location?id=${loc.id}&name=${encodeURIComponent(loc.name)}`,
                    )
                  }
                >
                  <Settings size={16} /> Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Modal
        isOpen={isFormBuilderOpen}
        onClose={() => {
          setIsFormBuilderOpen(false);
          setPreviewMode(null);
        }}
        title={
          previewMode
            ? `Preview: ${formConfig.title || "Untitled Form"}`
            : "Form Builder"
        }
        size="full"
      >
        <div className="form-builder-container-premium">
          {!previewMode ? (
            <div className="builder-interface fade-in">
              <div className="builder-header-sticky">
                <div className="header-main-info">
                  <div className="title-area">
                    <input
                      type="text"
                      className="form-title-input-ghost"
                      placeholder="Untitled Form"
                      value={formConfig.title}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          title: e.target.value,
                        })
                      }
                    />
                    <div className="save-status">
                      <div className="status-dot"></div>
                      <span>
                        {formConfig.status === "draft"
                          ? "Draft"
                          : "Published"}{" "}
                        &bull; Auto-saved
                      </span>
                    </div>
                  </div>
                  <div className="header-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDraft}
                    >
                      Save
                    </Button>
                    <Button
                      className="btn-premium"
                      size="sm"
                      onClick={() => setIsDistributionModalOpen(true)}
                      style={{
                        opacity: formFields.length === 0 ? 0.5 : 1,
                        pointerEvents:
                          formFields.length === 0 ? "none" : "auto",
                      }}
                    >
                      Publish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                      title="Preview Form"
                    >
                      <Eye size={18} />
                    </Button>
                  </div>
                </div>
                <div className="description-area">
                  <textarea
                    className="form-desc-input-ghost"
                    placeholder="Add an optional description for this form..."
                    value={formConfig.description}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        description: e.target.value,
                      })
                    }
                  />
                  {formFields.length > 0 && (
                    <div style={{ display: "flex", marginTop: "8px" }}>
                      <Button
                        className="btn-premium btn-add-field-premium"
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          fontSize: "13px",
                        }}
                      >
                        <Plus size={16} /> Add Field
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="builder-body-scrollable">
                <div className="fields-stack">
                  {formFields.length === 0 ? (
                    <div className="empty-builder-state fade-in">
                      <div
                        className="empty-icon"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "var(--bg)",
                          borderRadius: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 24px",
                          color: "var(--blue)",
                        }}
                      >
                        <Layout size={40} />
                      </div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          marginBottom: "8px",
                        }}
                      >
                        Your form is empty
                      </h3>
                      <p
                        style={{
                          color: "var(--text-tertiary)",
                          fontSize: "13px",
                          maxWidth: "280px",
                          margin: "0 auto 16px",
                        }}
                      >
                        Start by adding your first field below.
                      </p>
                      <Button
                        className="btn-premium btn-add-field-premium first-field"
                        onClick={() => setIsFieldSelectorOpen(true)}
                        style={{
                          gap: "8px",
                          padding: "10px 24px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 800,
                        }}
                      >
                        <Plus size={18} /> Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    formFields.map((field, idx) => (
                      <div
                        key={field.key}
                        className="field-card-premium animate-slide-up"
                      >
                        <div className="field-card-drag-handle">
                          <GripVertical size={16} />
                        </div>

                        <div className="field-card-header">
                          <div className="field-type-badge">
                            {fieldTypes.find((t) => t.id === field.type)?.icon &&
                              React.createElement(
                                fieldTypes.find((t) => t.id === field.type)!
                                  .icon,
                                { size: 14 },
                              )}
                            <span>
                              {
                                fieldTypes.find((t) => t.id === field.type)
                                  ?.label
                              }
                            </span>
                          </div>
                          <div className="field-actions-top">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newField: FormField = {
                                  ...field,
                                  key: `field_${Date.now()}`,
                                };
                                setFormFields([
                                  ...formFields.slice(0, idx + 1),
                                  newField,
                                  ...formFields.slice(idx + 1),
                                ]);
                              }}
                              title="Duplicate Field"
                            >
                              <Layers size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red"
                              onClick={() =>
                                setFormFields(
                                  formFields.filter((f) => f.key !== field.key),
                                )
                              }
                              title="Delete Field"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="field-card-main">
                          <Input
                            placeholder="Question Title"
                            value={field.label}
                            onChange={(e) =>
                              updateField(idx, { label: e.target.value })
                            }
                            className="field-title-input"
                          />
                        </div>

                        <div className="field-card-footer">
                          <div className="footer-left">
                            <label className="toggle-label-premium">
                              <input
                                type="checkbox"
                                checked={field.required ?? false}
                                onChange={(e) =>
                                  updateField(idx, {
                                    required: e.target.checked,
                                  })
                                }
                              />
                              <span>Required</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`form-preview-overlay fade-in mode-${previewMode}`}>
              <div className="preview-toolbar">
                <div className="preview-devices">
                  <button
                    className={previewMode === "mobile" ? "active" : ""}
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <PhoneIcon size={18} />
                  </button>
                  <button
                    className={previewMode === "desktop" ? "active" : ""}
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor size={18} />
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode(null)}>
                  Exit Preview
                </Button>
              </div>
              <div className="preview-frame-container">
                <div className="preview-frame">
                  <div className="preview-content-scroller">
                    <div className="preview-form-header">
                      <h1>{formConfig.title || "Untitled Form"}</h1>
                      <p>{formConfig.description}</p>
                    </div>
                    <div className="preview-fields">
                      {formFields.map((f) => (
                        <div key={f.key} className="preview-field-item">
                          <label>
                            {f.label}{" "}
                            {f.required && <span className="text-red">*</span>}
                          </label>
                          <div className="preview-input-container">
                            {["text", "email", "phone", "url", "number"].includes(
                              f.type ?? "",
                            ) && <Input placeholder={`Enter your ${f.type}...`} readOnly />}
                            {String(f.type) === "longtext" && (
                              <textarea
                                placeholder="Describe in detail..."
                                readOnly
                                className="preview-textarea"
                                style={{
                                  width: "100%",
                                  borderRadius: "12px",
                                  border: "1px solid var(--border-light)",
                                  minHeight: "100px",
                                  padding: "12px",
                                  fontSize: "14px",
                                  outline: "none",
                                }}
                              />
                            )}
                            {["radio", "checkbox"].includes(String(f.type)) && (
                              <div className="preview-options">
                                {(f.options ?? []).map((o) => (
                                  <label
                                    key={o.value}
                                    className="preview-option-pill"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      fontSize: "14px",
                                      marginBottom: "10px",
                                      padding: "10px",
                                      background: "var(--bg)",
                                      borderRadius: "10px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      type={String(f.type) === "checkbox" ? "checkbox" : "radio"}
                                      disabled
                                      style={{ accentColor: "var(--blue)" }}
                                    />{" "}
                                    {o.label}
                                  </label>
                                ))}
                              </div>
                            )}
                            {f.type === "dropdown" && (
                              <select
                                disabled
                                className="preview-select"
                                style={{
                                  width: "100%",
                                  padding: "12px",
                                  borderRadius: "12px",
                                  border: "1px solid var(--border-light)",
                                  background: "var(--bg)",
                                  fontSize: "14px",
                                }}
                              >
                                <option>Select an option...</option>
                                {(f.options ?? []).map((o) => (
                                  <option key={o.value}>{o.label}</option>
                                ))}
                              </select>
                            )}
                            {["date", "time"].includes(f.type ?? "") && (
                              <div
                                className="preview-date-time-box"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "12px",
                                  border: "1px solid var(--border-light)",
                                  borderRadius: "12px",
                                  background: "var(--bg)",
                                  color: "var(--text-tertiary)",
                                }}
                              >
                                <Calendar size={18} />{" "}
                                <span>Pick a {f.type}...</span>
                              </div>
                            )}
                            {["fileupload", "image"].includes(String(f.type)) && (
                              <div
                                className="preview-upload-box"
                                style={{
                                  padding: "32px",
                                  border: "2px dashed var(--border-light)",
                                  borderRadius: "16px",
                                  textAlign: "center",
                                  color: "var(--text-tertiary)",
                                }}
                              >
                                <FileUp
                                  size={24}
                                  style={{ margin: "0 auto 8px" }}
                                />
                                <p style={{ fontSize: "13px" }}>
                                  Click or drag{" "}
                                  {String(f.type) === "image" ? "image" : "file"} to
                                  upload
                                </p>
                              </div>
                            )}
                            {f.type === "signature" && (
                              <div
                                className="preview-signature-pad"
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  background: "var(--bg)",
                                  border: "1px solid var(--border-light)",
                                  borderRadius: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--text-tertiary)",
                                  fontStyle: "italic",
                                }}
                              >
                                Draw your signature here...
                              </div>
                            )}
                            {f.type === "address" && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                <Input placeholder="Street Address" readOnly />
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <Input placeholder="City" readOnly />
                                  <Input placeholder="Zip Code" readOnly />
                                </div>
                              </div>
                            )}
                            {String(f.type) === "paragraph" && (
                              <p
                                style={{
                                  fontSize: "14px",
                                  lineHeight: "1.6",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {f.help_text ||
                                  "Paragraph informational text will appear here."}
                              </p>
                            )}
                            {f.type === "rating" && (
                              <div
                                className="preview-rating"
                                style={{
                                  display: "flex",
                                  gap: "12px",
                                  justifyContent: "center",
                                  padding: "10px",
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    size={32}
                                    style={{
                                      color: "var(--border-light)",
                                      cursor: "pointer",
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            {String(f.type) === "divider" && (
                              <hr
                                className="preview-divider"
                                style={{
                                  border: "none",
                                  borderTop: "2px solid var(--bg)",
                                  margin: "12px 0",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="preview-footer"
                      style={{ marginTop: "40px" }}
                    >
                      <Button className="btn-premium" fullWidth>
                        Submit Form
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        title="Form Settings & Distribution"
      >
        <div
          className="distribution-modal-content fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            paddingBottom: "40px",
          }}
        >
          <section className="dist-section">
            <div
              className="dist-section-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={18} className="text-green" />
              <h4 style={{ fontSize: "16px", fontWeight: 800 }}>
                Public Privacy
              </h4>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-tertiary)",
                marginBottom: "16px",
              }}
            >
              Control who can access this form via public link or QR code.
            </p>
            <div className="privacy-options-stack">
              <div
                className={`privacy-option ${
                  formDistribution.mode === "public" ? "active" : ""
                }`}
                onClick={() =>
                  setFormDistribution({ ...formDistribution, mode: "public" })
                }
              >
                <Share size={20} />
                <div className="opt-text">
                  <strong>General Public (Open)</strong>
                  <span>Anyone with the link can fill this form.</span>
                </div>
              </div>
              <div
                className={`privacy-option ${
                  formDistribution.mode === "registered" ? "active" : ""
                }`}
                onClick={() =>
                  setFormDistribution({
                    ...formDistribution,
                    mode: "registered",
                  })
                }
              >
                <LogIn size={20} />
                <div className="opt-text">
                  <strong>Registered Members Only</strong>
                  <span>
                    Users must be logged into their Harvite account.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div
            className="modal-footer-actions"
            style={{ display: "flex", gap: "12px", marginTop: "12px" }}
          >
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setIsDistributionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-premium"
              fullWidth
              onClick={() => handlePublishForm()}
            >
              {editingFormId ? "Save & Update" : "Publish & Go Live"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isFieldSelectorOpen}
        onClose={() => setIsFieldSelectorOpen(false)}
        title="Add New Field"
        size="xl"
      >
        <div className="field-selector-container fade-in">
          <div className="selector-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search field types..." />
          </div>

          <div className="selector-categories">
            {["Standard", "Choice", "Date & Time", "Media", "Advanced", "Layout"].map(
              (cat) => (
                <div key={cat} className="selector-cat-group">
                  <h4 className="cat-title">{cat}</h4>
                  <div className="selector-grid">
                    {fieldTypes
                      .filter((t) => t.cat === cat)
                      .map((type) => (
                        <button
                          key={type.id}
                          className="field-type-item"
                          onClick={() => addField(type.id)}
                        >
                          <div className="item-icon-box">
                            {React.createElement(type.icon, { size: 20 })}
                          </div>
                          <div className="item-text">
                            <strong>{type.label}</strong>
                            <span>{type.desc}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={isPublishSuccessOpen}
        onClose={() => setIsPublishSuccessOpen(false)}
        icon="form"
        title="Form Published Successfully!"
        description="Your form is live and accepting submissions."
        primaryAction={{
          label: "Back to Dashboard",
          navigateTo: "/main/forms",
        }}
      />
    </div>
  );
}
