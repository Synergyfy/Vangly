"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Shield,
  Download,
  Copy,
  ExternalLink,
  Plus,
  MoreHorizontal,
  Trash2,
  MessageCircle,
  MessageSquare,
  Share,
  LogIn,
  DownloadCloud,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Trash,
  Info,
  ShieldCheck,
  Hash,
  AtSign,
  Smartphone,
  List,
  Image as ImageIcon,
  PenTool,
  Star,
  Link,
  MapPin,
  Eye,
  Layout,
  Layers,
  Settings,
  Edit2,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  useArchiveForm,
  useCloneTeam,
  useCreateForm,
  useCreateMember,
  useCreateTeam,
  useDeleteMember,
  useForm,
  useFormResponses,
  useLocation,
  useLocationDashboard,
  useLocationTeams,
  useLocationsList,
  usePublishForm,
  useTeamDetail,
  useUpdateForm,
  useUpdateMember,
  useUpdateTeam,
} from "@/services/manage-organization";
import { exportMembersUrl, exportFormResponsesUrl } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth-token";
import type {
  DashboardTimeframe,
  LocationDashboardEntity,
  PerformanceTabData,
  SettingsTabData,
} from "@/types/api/locations";
import type {
  FormEntity,
  FormField,
  FormFieldType,
  FormStatus,
  Member,
  Team,
  TeamDetailForm,
} from "@/types/api/teams";
import "../../management.css";

type Tab = "performance" | "teams" | "settings";
type TeamView = "grid" | "details";
type TeamSubView = "home" | "members" | "forms";

const FIELD_TYPES: Array<{
  id: FormFieldType;
  label: string;
  cat: "Standard" | "Choice" | "Date & Time" | "Media" | "Advanced";
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "text", label: "Short Text", cat: "Standard", desc: "Single line of text.", icon: Type },
  { id: "multiline", label: "Long Text", cat: "Standard", desc: "Multiple lines for longer answers.", icon: AlignLeft },
  { id: "number", label: "Number", cat: "Standard", desc: "Numeric input only.", icon: Hash },
  { id: "email", label: "Email", cat: "Standard", desc: "Email address validation.", icon: AtSign },
  { id: "phone", label: "Phone", cat: "Standard", desc: "International phone format.", icon: Smartphone },
  { id: "single_choice", label: "Single Choice", cat: "Choice", desc: "Select exactly one option.", icon: Circle },
  { id: "multi_choice", label: "Multi Choice", cat: "Choice", desc: "Select multiple options.", icon: CheckSquare },
  { id: "dropdown", label: "Dropdown", cat: "Choice", desc: "Choose from a compact list.", icon: List },
  { id: "date", label: "Date", cat: "Date & Time", desc: "Pick a specific calendar date.", icon: Calendar },
  { id: "signature", label: "Signature", cat: "Advanced", desc: "Digital signature capture.", icon: PenTool },
  { id: "rating", label: "Rating", cat: "Advanced", desc: "Star or scale-based feedback.", icon: Star },
  { id: "photo", label: "Photo", cat: "Media", desc: "Photo upload.", icon: ImageIcon },
  { id: "barcode", label: "Barcode", cat: "Advanced", desc: "Scan a barcode or QR code.", icon: Link },
  { id: "address", label: "Address", cat: "Standard", desc: "Location or postal details.", icon: MapPin },
];

const CATEGORIES = ["Standard", "Choice", "Date & Time", "Media", "Advanced"] as const;

const EMPTY_TEAMS: Team[] = [];

const CHOICE_FIELDS: FormFieldType[] = [
  "single_choice",
  "multi_choice",
  "dropdown",
];

function fieldNeedsOptions(t: FormFieldType): boolean {
  return CHOICE_FIELDS.includes(t);
}

function fieldHasOptions(t: FormFieldType): boolean {
  return t === "single_choice" || t === "multi_choice" || t === "dropdown";
}

function makeEmptyField(type: FormFieldType): FormField {
  return {
    key: `f_${Math.random().toString(36).slice(2, 9)}`,
    label: "",
    type,
    required: false,
    help_text: undefined,
    placeholder: undefined,
    options: fieldHasOptions(type)
      ? [
          { value: "Option 1", label: "Option 1" },
          { value: "Option 2", label: "Option 2" },
        ]
      : undefined,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function downloadCsv(url: string, fallbackName: string) {
  const token = getAccessToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new ApiError(res.status, {
      message: `Failed to download (${res.status})`,
    });
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") ?? "";
  const match = cd.match(/filename="?([^"]+)"?/);
  downloadBlob(blob, match?.[1] ?? fallbackName);
}

function downloadSvgAsPng(svgId: string, filename: string) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width + 40;
    canvas.height = img.height + 40;
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = filename;
      a.href = pngFile;
      a.click();
    }
  };
  img.src = "data:image/svg+xml;base64," + btoa(svgData);
}

// ────────────────────────────────────────────────────────────
// Performance tab
// ────────────────────────────────────────────────────────────

function PerformanceTab({ data }: { data: PerformanceTabData }) {
  const stats = data.stats;
  const buckets = data.attendance.buckets;
  const maxValue = Math.max(1, ...buckets.map((b) => b.value));

  return (
    <div className="fade-in">
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <Card key={i} className="stat-card glass-morphism">
            <div
              className={`stat-icon-box ${
                i % 4 === 0
                  ? "blue"
                  : i % 4 === 1
                    ? "purple"
                    : i % 4 === 2
                      ? "green"
                      : "blue"
              }`}
            >
              {i === 0 ? (
                <Users size={20} />
              ) : i === 1 ? (
                <Target size={20} />
              ) : i === 2 ? (
                <TrendingUp size={20} />
              ) : (
                <Star size={20} />
              )}
            </div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
              {stat.change_pct !== undefined ? (
                <div
                  className={`stat-change ${stat.is_up ? "positive" : "negative"}`}
                >
                  {stat.is_up ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  <span>
                    {stat.is_up ? "+" : ""}
                    {stat.change_pct.toFixed(1)}%
                  </span>
                </div>
              ) : stat.meta ? (
                <div className="stat-change positive">
                  <span>{stat.meta}</span>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="performance-layout-grid">
        <Card className="chart-placeholder-card main-chart">
          <div className="card-header">
            <h3>Attendance Overview</h3>
            <div className="chart-filters">
              <span className="active">
                {data.attendance.timeframe === "week"
                  ? "Week"
                  : data.attendance.timeframe === "month"
                    ? "Month"
                    : "Year"}
              </span>
            </div>
          </div>
          <div className="attendance-chart-container">
            <div className="chart-y-axis">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.66)}</span>
              <span>{Math.round(maxValue * 0.33)}</span>
              <span>0</span>
            </div>
            <div className="chart-main-area">
              <div className="chart-grid-lines">
                <div className="grid-line" />
                <div className="grid-line" />
                <div className="grid-line" />
                <div className="grid-line" />
              </div>
              <div className="chart-bars">
                {buckets.map((d, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="bar-tooltip">{d.value}</div>
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${(d.value / maxValue) * 100}%` }}
                    />
                    <span className="bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="performance-breakdown-card">
          <div className="card-header">
            <h3>Recent Milestones</h3>
          </div>
          <div className="milestone-list">
            {data.milestones.map((m, i) => (
              <div key={i} className="milestone-item">
                <div className="m-icon">
                  {m.icon === "calendar" ? (
                    <Calendar size={18} />
                  ) : m.icon === "users" ? (
                    <Users size={18} />
                  ) : (
                    <Target size={18} />
                  )}
                </div>
                <div className="m-info">
                  <p className="m-label">{m.label}</p>
                  <p className="m-value">{m.value}</p>
                </div>
                <span className="m-date">{m.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Teams tab
// ────────────────────────────────────────────────────────────

function TeamCard({
  team,
  onClick,
  onSendSms,
  onCreateForm,
  onSettings,
  onQr,
}: {
  team: Team;
  onClick: () => void;
  onSendSms: () => void;
  onCreateForm: () => void;
  onSettings: () => void;
  onQr: () => void;
}) {
  return (
    <Card
      className="group-card-premium fade-in"
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: "1px solid var(--border-light)",
      }}
      onClick={onClick}
    >
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div className="group-info-main">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              {team.name}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                lineHeight: 1.4,
              }}
            >
              {team.description || "No description available."}
            </p>
          </div>
          <div
            style={{ display: "flex", gap: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label="Send SMS"
                style={{
                  width: 36,
                  height: 36,
                  padding: 0,
                  borderRadius: 10,
                  color: "var(--blue)",
                  background: "var(--blue-subtle)",
                }}
                onClick={onSendSms}
              >
                <Smartphone size={16} />
              </Button>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--blue)",
                  textTransform: "uppercase",
                }}
              >
                SMS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label="Create form"
                style={{
                  width: 36,
                  height: 36,
                  padding: 0,
                  borderRadius: 10,
                  background: "var(--bg)",
                }}
                onClick={onCreateForm}
              >
                <Plus size={16} />
              </Button>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                Form
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label="Team settings"
                style={{
                  width: 36,
                  height: 36,
                  padding: 0,
                  borderRadius: 10,
                  background: "var(--bg)",
                }}
                onClick={onSettings}
              >
                <BarChart3 size={16} />
              </Button>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                Setup
              </span>
            </div>
            {team.name !== "Admin" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Team QR"
                  style={{
                    width: 36,
                    height: 36,
                    padding: 0,
                    borderRadius: 10,
                    background: "var(--bg)",
                  }}
                  onClick={onQr}
                >
                  <QrCode size={16} />
                </Button>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  QR
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--blue)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {team.member_count} {team.member_count === 1 ? "Member" : "Members"}
            <ChevronRight size={14} />
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-tertiary)",
            }}
          >
            {team.form_count} {team.form_count === 1 ? "Form" : "Forms"}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Settings tab
// ────────────────────────────────────────────────────────────

function SettingsTab({ data }: { data: SettingsTabData }) {
  return (
    <div className="fade-in">
      <div className="performance-layout-grid">
        <Card className="performance-breakdown-card">
          <div className="card-header">
            <h3>General Configuration</h3>
          </div>
          <div className="config-list-premium">
            <div className="config-item-row">
              <div className="config-label">Location Status</div>
              <div
                className="config-value"
                style={{
                  color: data.status === "active" ? "var(--green)" : "var(--text-tertiary)",
                  fontWeight: 700,
                }}
              >
                {data.status === "active"
                  ? "Active"
                  : data.status === "paused"
                    ? "Paused"
                    : "Archived"}
              </div>
            </div>
            <div className="config-item-row">
              <div className="config-label">Primary Admin</div>
              <div className="config-value">
                {data.primary_admin?.name ?? "—"}
              </div>
            </div>
            <div className="config-item-row">
              <div className="config-label">Security Protocol</div>
              <div className="config-value">{data.security_protocol}</div>
            </div>
            <div className="config-item-row">
              <div className="config-label">Created</div>
              <div className="config-value">
                {new Date(data.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main dashboard content
// ────────────────────────────────────────────────────────────

function LocationDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("id") ?? "";
  const locationName = searchParams.get("name") ?? "Location";

  const [activeTab, setActiveTab] = React.useState<Tab>("performance");
  const [timeframe, setTimeframe] = React.useState<DashboardTimeframe>("week");

  const [teamView, setTeamView] = React.useState<TeamView>("grid");
  const [teamSubView, setTeamSubView] = React.useState<TeamSubView>("home");
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(
    null,
  );

  // Modal state
  const [createTeamOpen, setCreateTeamOpen] = React.useState(false);
  const [createMemberOpen, setCreateMemberOpen] = React.useState(false);
  const [editMemberOpen, setEditMemberOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [userActionOpen, setUserActionOpen] = React.useState(false);
  const [userActionMember, setUserActionMember] = React.useState<Member | null>(
    null,
  );
  const [teamSettingsOpen, setTeamSettingsOpen] = React.useState(false);
  const [teamSettingsId, setTeamSettingsId] = React.useState<string | null>(
    null,
  );
  const [teamQrOpen, setTeamQrOpen] = React.useState(false);
  const [teamQrId, setTeamQrId] = React.useState<string | null>(null);

  const [formBuilderOpen, setFormBuilderOpen] = React.useState(false);
  const [editingFormId, setEditingFormId] = React.useState<string | null>(null);
  const [formConfig, setFormConfig] = React.useState<{
    title: string;
    description: string;
    status: FormStatus;
  }>({ title: "", description: "", status: "draft" });
  const [formFields, setFormFields] = React.useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = React.useState<"mobile" | "desktop" | null>(
    null,
  );
  const [fieldSelectorOpen, setFieldSelectorOpen] = React.useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = React.useState(false);
  const [publishedForm, setPublishedForm] = React.useState<FormEntity | null>(
    null,
  );
  const [responsesOpen, setResponsesOpen] = React.useState(false);
  const [responsesFormId, setResponsesFormId] = React.useState<string | null>(
    null,
  );
  const [networkImportOpen, setNetworkImportOpen] = React.useState(false);
  const [networkImportKind, setNetworkImportKind] = React.useState<
    "group" | "form"
  >("group");
  const [networkSourceLocationId, setNetworkSourceLocationId] = React.useState<
    string | null
  >(null);
  const [copyingFormId, setCopyingFormId] = React.useState<string | null>(null);

  const [newTeam, setNewTeam] = React.useState({
    name: "",
    description: "",
    is_public_joinable: true,
    allow_member_pin: true,
  });
  const [newMember, setNewMember] = React.useState({
    name: "",
    phone: "",
    email: "",
    pin: "",
    is_admin: false,
  });

  const [copied, setCopied] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  // Data hooks
  const locationQuery = useLocation(locationId);
  const teamsQuery = useLocationTeams(locationId);
  const teamDetailQuery = useTeamDetail(locationId, selectedTeamId ?? "");
  const editingFormQuery = useForm(editingFormId ?? "");
  const copyingFormQuery = useForm(copyingFormId ?? "");
  const responsesFormQuery = useForm(responsesFormId ?? "");
  const responsesQuery = useFormResponses(responsesFormId ?? "");
  const allLocationsQuery = useLocationsList({ per_page: 100 });

  const dashboardParams = React.useMemo(
    () => ({ tab: activeTab, timeframe }),
    [activeTab, timeframe],
  );
  const dashboardQuery = useLocationDashboard(locationId, dashboardParams);

  // Mutations
  const createTeamMut = useCreateTeam();
  const updateTeamMut = useUpdateTeam();
  const createMemberMut = useCreateMember();
  const updateMemberMut = useUpdateMember();
  const deleteMemberMut = useDeleteMember();
  const createFormMut = useCreateForm();
  const updateFormMut = useUpdateForm();
  const publishFormMut = usePublishForm();
  const archiveFormMut = useArchiveForm();

  const teams = React.useMemo(
    () => teamsQuery.data?.data ?? EMPTY_TEAMS,
    [teamsQuery.data],
  );
  const dashboard = dashboardQuery.data as LocationDashboardEntity | undefined;
  const selectedTeam = teamDetailQuery.data?.team;
  const teamMembers = teamDetailQuery.data?.members ?? [];
  const teamForms: TeamDetailForm[] = teamDetailQuery.data?.forms ?? [];

  const teamById = React.useMemo(() => {
    const m = new Map<string, Team>();
    for (const t of teams) m.set(t.id, t);
    return m;
  }, [teams]);

  // Team join URL — mirrors the original `${locationUrl}/join?role=${team}`.
  const teamJoinUrl = React.useCallback(
    (team: Team) => {
      const slug = team.name.toLowerCase().replace(/\s+/g, "-");
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      return `${base}/join?role=${encodeURIComponent(slug)}&team_id=${team.id}`;
    },
    [],
  );

  // ── Handlers ────────────────────────────────────────────

  const openTeam = (team: Team) => {
    setSelectedTeamId(team.id);
    setTeamView("details");
    setTeamSubView("home");
  };

  const openFormBuilder = (team: Team, formId: string | null) => {
    setSelectedTeamId(team.id);
    if (formId) {
      setEditingFormId(formId);
    } else {
      setEditingFormId(null);
      setFormFields([]);
      setFormConfig({ title: "", description: "", status: "draft" });
    }
    setFormBuilderOpen(true);
  };

  // The form builder uses local edit state, and the query result is the
  // source of truth on open. Reseeding local state from the query on form-id
  // change is the correct pattern here — we are not mirroring cache into
  // state for display, we are copying server data into a working copy for
  // edits. The effect only fires when the query data or the modal-open flag
  // changes, so there is no cascade.
  React.useEffect(() => {
    if (editingFormQuery.data && formBuilderOpen) {
      const f = editingFormQuery.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- seeding local edit state from query result on open
      setFormConfig({
        title: f.title,
        description: f.description ?? "",
        status: f.status,
      });
      setFormFields(f.fields);
    }
  }, [editingFormQuery.data, formBuilderOpen]);

  // When the user clicks "Copy public link" on a published form card, we
  // fetch the full form (the team detail endpoint doesn't return
  // public_url), then copy it to the clipboard and reset the trigger.
  React.useEffect(() => {
    if (!copyingFormId || !copyingFormQuery.data) return;
    const url = copyingFormQuery.data.public_url;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot trigger reset, no cascade
    setCopyingFormId(null);
    if (!url) return;
    void navigator.clipboard.writeText(url).catch(() => {
      setExportError("Couldn’t copy the form link to the clipboard.");
    });
  }, [copyingFormId, copyingFormQuery.data]);

  const handleAddField = (type: FormFieldType) => {
    setFormFields((arr) => [...arr, makeEmptyField(type)]);
    setFieldSelectorOpen(false);
  };

  const handleSaveForm = async (publish: boolean) => {
    if (!selectedTeamId) return;
    if (formFields.length === 0) return;
    const title = formConfig.title.trim();
    if (!title) return;

    const input = {
      title,
      description: formConfig.description.trim() || undefined,
      fields: formFields,
      distribution: { mode: "public" as const },
    };

    try {
      if (editingFormId) {
        const updated = await updateFormMut.mutateAsync({
          formId: editingFormId,
          input: {
            title: input.title,
            description: input.description,
            fields: input.fields,
            distribution: input.distribution,
          },
        });
        if (publish && updated.status !== "published") {
          const pub = await publishFormMut.mutateAsync(editingFormId);
          setPublishedForm(pub);
          setPublishSuccessOpen(true);
        }
      } else {
        const created = await createFormMut.mutateAsync({
          teamId: selectedTeamId,
          input,
        });
        setEditingFormId(created.id);
        if (publish) {
          const pub = await publishFormMut.mutateAsync(created.id);
          setPublishedForm(pub);
          setPublishSuccessOpen(true);
        }
      }
      setFormBuilderOpen(false);
    } catch {
      // Error surfaced via mutation state below.
    }
  };

  const handleCreateTeamSubmit = async () => {
    if (!newTeam.name.trim()) return;
    await createTeamMut.mutateAsync({
      locationId,
      input: {
        name: newTeam.name.trim(),
        description: newTeam.description.trim() || undefined,
        is_public_joinable: newTeam.is_public_joinable,
        allow_member_pin: newTeam.allow_member_pin,
      },
    });
    setNewTeam({
      name: "",
      description: "",
      is_public_joinable: true,
      allow_member_pin: true,
    });
    setCreateTeamOpen(false);
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.phone.trim() || !selectedTeamId) {
      return;
    }
    await createMemberMut.mutateAsync({
      locationId,
      input: {
        name: newMember.name.trim(),
        phone: newMember.phone.trim(),
        email: newMember.email.trim() || undefined,
        pin: newMember.pin.trim() || undefined,
        team_ids: [selectedTeamId],
        is_team_admin: newMember.is_admin ? [selectedTeamId] : [],
      },
    });
    setNewMember({ name: "", phone: "", email: "", pin: "", is_admin: false });
    setCreateMemberOpen(false);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    await updateMemberMut.mutateAsync({
      memberId: editingMember.id,
      input: {
        name: editingMember.name,
        phone: editingMember.phone,
        email: editingMember.email,
      },
    });
    setEditMemberOpen(false);
    setEditingMember(null);
  };

  const handleRemoveMember = async (member: Member) => {
    await deleteMemberMut.mutateAsync({
      memberId: member.id,
      locationId,
    });
  };

  // ── Render guards ───────────────────────────────────────

  if (!locationId) {
    return (
      <Card
        style={{
          padding: 32,
          margin: 32,
          textAlign: "center",
          color: "var(--text-tertiary)",
        }}
      >
        <AlertCircle size={32} style={{ opacity: 0.5 }} />
        <h3 style={{ fontWeight: 800, marginTop: 12 }}>No location selected</h3>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Open a location from the network page.
        </p>
        <Button
          className="btn-premium"
          onClick={() => router.push("/main/manage-organization")}
          style={{ marginTop: 16 }}
        >
          Back to locations
        </Button>
      </Card>
    );
  }

  if (locationQuery.isError) {
    return (
      <Card
        style={{
          padding: 32,
          margin: 32,
          color: "var(--text-tertiary)",
        }}
      >
        <AlertCircle size={24} color="var(--red, #ef4444)" />
        <h3 style={{ fontWeight: 800, marginTop: 12 }}>
          Couldn’t load this location
        </h3>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          {(locationQuery.error as ApiError)?.body?.message ?? "Unknown error"}
        </p>
        <Button
          variant="outline"
          onClick={() => locationQuery.refetch()}
          style={{ marginTop: 16 }}
        >
          Try again
        </Button>
      </Card>
    );
  }

  const dashboardError = dashboardQuery.error as ApiError | null;
  const formsBusy =
    createFormMut.isPending ||
    updateFormMut.isPending ||
    publishFormMut.isPending ||
    archiveFormMut.isPending;

  // ── Layout ──────────────────────────────────────────────

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/main/manage-organization")}
            className="back-btn-pill"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: 12 }}>
            <div className="header-badge">Location Command</div>
            <h1>{locationQuery.data?.name ?? locationName}</h1>
            <p>
              {locationQuery.data
                ? `${locationQuery.data.city}${
                    locationQuery.data.state
                      ? `, ${locationQuery.data.state}`
                      : ""
                  }`
                : "Optimize performance and manage teams for this hub."}
            </p>
          </div>
        </div>

        <div className="location-management-hub">
          {[
            { id: "performance", label: "Analytics", icon: BarChart3, desc: "Growth" },
            { id: "teams", label: "Teams", icon: Users, desc: "Structure" },
            { id: "settings", label: "Setup", icon: Settings, desc: "Config" },
          ].map((t) => (
            <div
              key={t.id}
              className={`hub-card-premium glass-morphism ${
                activeTab === t.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(t.id as Tab)}
              role="tab"
              tabIndex={0}
            >
              <div className="hub-card-icon-box">
                <t.icon size={20} />
              </div>
              <strong>{t.label}</strong>
              <span className="hub-card-desc">{t.desc}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="dashboard-main-content">
        {exportError ? (
          <Card
            className="glass-morphism"
            style={{
              padding: 16,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <AlertCircle size={18} color="var(--red, #ef4444)" />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 13 }}>Export failed</strong>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  marginTop: 4,
                }}
              >
                {exportError}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExportError(null)}
              aria-label="Dismiss"
            >
              ×
            </Button>
          </Card>
        ) : null}

        {activeTab === "performance" ? (
          <>
            <div
              className="timeframe-switcher"
              style={{
                display: "inline-flex",
                gap: 4,
                padding: 4,
                background: "var(--bg)",
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              {(["week", "month", "year"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  aria-pressed={timeframe === tf}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    border: "none",
                    background: timeframe === tf ? "white" : "transparent",
                    color:
                      timeframe === tf
                        ? "var(--text-primary)"
                        : "var(--text-tertiary)",
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow:
                      timeframe === tf ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
            {dashboardQuery.isLoading ? (
              <Card style={{ padding: 24 }}>Loading analytics…</Card>
            ) : dashboardError ? (
              <Card style={{ padding: 24 }}>
                <AlertCircle size={20} color="var(--red, #ef4444)" />
                <p style={{ marginTop: 8 }}>
                  {dashboardError.body?.message ?? "Couldn’t load analytics."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dashboardQuery.refetch()}
                  style={{ marginTop: 12 }}
                >
                  Try again
                </Button>
              </Card>
            ) : dashboard?.data && (dashboard.data as PerformanceTabData).stats ? (
              <PerformanceTab data={dashboard.data as PerformanceTabData} />
            ) : null}
          </>
        ) : null}

        {activeTab === "teams" ? (
          <div className="fade-in">
            {teamView === "grid" ? (
              <>
                <div
                  className="users-management-header"
                  style={{ marginBottom: 16 }}
                >
                  <div className="user-actions" style={{ marginLeft: "auto" }}>
                    <Button
                      variant="outline"
                      style={{ gap: 8 }}
                      onClick={() => {
                        setExportError(null);
                        void downloadCsv(exportMembersUrl(locationId), "members.csv").catch(
                          (err: unknown) => {
                            setExportError(
                              err instanceof ApiError
                                ? err.body.message
                                : "Couldn’t download members export.",
                            );
                          },
                        );
                      }}
                    >
                      <DownloadCloud size={18} /> Export Members
                    </Button>
                    <Button
                      variant="ghost"
                      className="btn-network-pill"
                      style={{ gap: 8 }}
                      onClick={() => {
                        setNetworkImportKind("group");
                        setNetworkImportOpen(true);
                      }}
                    >
                      <Layers size={18} /> Import Network
                    </Button>
                    <Button
                      className="btn-premium"
                      style={{ gap: 8 }}
                      onClick={() => setCreateTeamOpen(true)}
                    >
                      <Plus size={18} /> Create Team
                    </Button>
                  </div>
                </div>

                {teamsQuery.isLoading ? (
                  <Card style={{ padding: 24 }}>Loading teams…</Card>
                ) : teamsQuery.isError ? (
                  <Card style={{ padding: 24 }}>
                    <AlertCircle
                      size={20}
                      color="var(--red, #ef4444)"
                    />
                    <p style={{ marginTop: 8 }}>
                      {(teamsQuery.error as ApiError)?.body?.message ??
                        "Couldn’t load teams."}
                    </p>
                  </Card>
                ) : teams.length === 0 ? (
                  <Card
                    className="glass-morphism"
                    style={{
                      padding: 48,
                      textAlign: "center",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <Users size={32} style={{ opacity: 0.5 }} />
                    <h3 style={{ fontWeight: 800, marginTop: 12 }}>
                      No teams yet
                    </h3>
                    <p style={{ fontSize: 13, marginTop: 4 }}>
                      Create a team to start grouping members and forms.
                    </p>
                    <Button
                      className="btn-premium"
                      onClick={() => setCreateTeamOpen(true)}
                      style={{ marginTop: 16 }}
                    >
                      <Plus size={16} /> Create Team
                    </Button>
                  </Card>
                ) : (
                  <div
                    className="groups-premium-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: 24,
                    }}
                  >
                    {teams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onClick={() => openTeam(team)}
                        onSendSms={() =>
                          router.push(
                            `/main/messages?target=team&name=${encodeURIComponent(team.name)}&location=${encodeURIComponent(locationQuery.data?.name ?? locationName)}`,
                          )
                        }
                        onCreateForm={() => openFormBuilder(team, null)}
                        onSettings={() => {
                          setTeamSettingsId(team.id);
                          setTeamSettingsOpen(true);
                        }}
                        onQr={() => {
                          if (!team.is_public_joinable) return;
                          setTeamQrId(team.id);
                          setTeamQrOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : selectedTeam ? (
              <div className="group-detail-view fade-in">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 32,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (teamSubView === "home") setTeamView("grid");
                          else setTeamSubView("home");
                        }}
                        style={{
                          padding: 0,
                          width: 32,
                          height: 32,
                          background: "var(--bg)",
                          borderRadius: 10,
                        }}
                        aria-label="Back"
                      >
                        <ArrowLeft size={18} />
                      </Button>
                      <h2
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {selectedTeam.name}
                      </h2>
                    </div>
                    <p
                      style={{
                        color: "var(--text-tertiary)",
                        fontSize: 15,
                      }}
                    >
                      {teamSubView === "home" &&
                        `Overview of assets and management for the ${selectedTeam.name} team.`}
                      {teamSubView === "members" &&
                        `Managing member roster for ${selectedTeam.name}.`}
                      {teamSubView === "forms" &&
                        `Form builder and response tracking for ${selectedTeam.name}.`}
                    </p>
                  </div>
                </div>

                {teamSubView === "home" ? (
                  <div
                    className="group-home-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 24,
                    }}
                  >
                    <Card
                      className="action-card-premium"
                      style={{
                        padding: 32,
                        cursor: "pointer",
                        border: "1px solid var(--border-light)",
                      }}
                      onClick={() => setTeamSubView("members")}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 20,
                          background: "var(--blue-subtle)",
                          color: "var(--blue)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                        }}
                      >
                        <Users size={32} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                        Members
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-tertiary)",
                          lineHeight: 1.6,
                          marginBottom: 20,
                        }}
                      >
                        Add members, bulk import workers, and manage team
                        administrative permissions.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--blue)",
                          }}
                        >
                          {selectedTeam.member_count} Members
                        </span>
                        <ChevronRight size={18} color="var(--blue)" />
                      </div>
                    </Card>

                    <Card
                      className="action-card-premium"
                      style={{
                        padding: 32,
                        cursor: "pointer",
                        border: "1px solid var(--border-light)",
                      }}
                      onClick={() => setTeamSubView("forms")}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 20,
                          background: "var(--purple-subtle)",
                          color: "var(--purple)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                        }}
                      >
                        <FileText size={32} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                        Forms
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-tertiary)",
                          lineHeight: 1.6,
                          marginBottom: 20,
                        }}
                      >
                        Create forms, manage data collection, and analyze team
                        responses.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--purple)",
                          }}
                        >
                          {selectedTeam.form_count} Forms
                        </span>
                        <ChevronRight size={18} color="var(--purple)" />
                      </div>
                    </Card>
                  </div>
                ) : null}

                {teamSubView === "members" ? (
                  <>
                    <div
                      className="members-view-header animate-fade-in"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                        Team Members
                      </h3>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/main/messages?target=team&name=${encodeURIComponent(selectedTeam.name)}&location=${encodeURIComponent(locationQuery.data?.name ?? locationName)}`,
                            )
                          }
                          style={{
                            gap: 8,
                            color: "var(--blue)",
                            borderColor: "var(--blue)",
                            background: "var(--blue-subtle)",
                          }}
                        >
                          <MessageSquare size={16} /> Send SMS
                        </Button>
                        <Button
                          className="btn-premium"
                          size="sm"
                          onClick={() => {
                            setCreateMemberOpen(true);
                          }}
                        >
                          <Plus size={16} /> Add Member
                        </Button>
                      </div>
                    </div>
                    <Card className="user-list-card-premium">
                      <table className="location-users-table">
                        <thead>
                          <tr>
                            <th>Member Details</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers.map(
                            (u: Member) => (
                              <tr key={u.id}>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                    }}
                                  >
                                    <div className="user-avatar-tiny">
                                      {u.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                        }}
                                      >
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>
                                          {u.name}
                                        </span>
                                        {u.team_admins?.includes(selectedTeam.name) ? (
                                          <span
                                            title="Team Admin"
                                            style={{
                                              color: "var(--blue)",
                                              display: "flex",
                                            }}
                                          >
                                            <Shield size={12} fill="var(--blue-subtle)" />
                                          </span>
                                        ) : null}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "var(--text-tertiary)",
                                        }}
                                      >
                                        {u.phone}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className={`status-badge-mini ${u.status}`}
                                  >
                                    {u.status}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <a
                                      href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="whatsapp-btn-tiny"
                                      title="WhatsApp Chat"
                                    >
                                      <MessageCircle size={16} />
                                    </a>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        router.push(
                                          `/main/messages?target=individual&phone=${encodeURIComponent(u.phone)}&name=${encodeURIComponent(u.name)}`,
                                        )
                                      }
                                      title="Send SMS"
                                    >
                                      <Smartphone size={16} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setUserActionMember(u);
                                        setUserActionOpen(true);
                                      }}
                                    >
                                      <MoreHorizontal size={16} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ),
                          )}
                          {teamMembers.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                style={{
                                  textAlign: "center",
                                  padding: 32,
                                  color: "var(--text-tertiary)",
                                }}
                              >
                                No members in this team yet.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </Card>
                  </>
                ) : null}

                {teamSubView === "forms" ? (
                  <div className="group-forms-view fade-in">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                        Team Forms
                      </h3>
                      <div style={{ display: "flex", gap: 12 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNetworkImportKind("form");
                            setNetworkImportOpen(true);
                          }}
                        >
                          <Layers size={16} /> Import from Network
                        </Button>
                        <Button
                          className="btn-premium"
                          size="sm"
                          style={{ gap: 8 }}
                          onClick={() => openFormBuilder(selectedTeam, null)}
                        >
                          <Plus size={16} /> Create Team Form
                        </Button>
                      </div>
                    </div>
                    <div
                      className="forms-grid-premium"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: 20,
                      }}
                    >
                      {teamForms.length === 0 ? (
                        <div
                          className="empty-forms-state"
                          style={{
                            gridColumn: "1/-1",
                            textAlign: "center",
                            padding: 60,
                            background: "var(--bg)",
                            borderRadius: 24,
                            border: "1px dashed var(--border-light)",
                          }}
                        >
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              background: "white",
                              borderRadius: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 16px",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            <FileText size={32} />
                          </div>
                          <h4 style={{ fontWeight: 800, marginBottom: 8 }}>
                            No forms yet
                          </h4>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--text-tertiary)",
                              maxWidth: 280,
                              margin: "0 auto",
                            }}
                          >
                            Create your first form to start collecting data
                            from {selectedTeam.name} members.
                          </p>
                        </div>
                      ) : (
                        teamForms.map((form) => (
                          <Card
                            key={form.id}
                            className="form-item-card-premium"
                            style={{
                              padding: 20,
                              border: "1px solid var(--border-light)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 12,
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 16,
                                    margin: 0,
                                  }}
                                >
                                  {form.title || "Untitled Form"}
                                </h4>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                    marginTop: 4,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: "var(--text-tertiary)",
                                    }}
                                  >
                                    {form.field_count} Fields
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: "var(--blue)",
                                      fontWeight: 700,
                                    }}
                                  >
                                    <QrCode
                                      size={12}
                                      style={{ verticalAlign: "middle", marginRight: 4 }}
                                    />
                                    {form.scans} Scans
                                  </p>
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background:
                                    form.status === "published"
                                      ? "var(--green-subtle)"
                                      : "var(--bg)",
                                  color:
                                    form.status === "published"
                                      ? "var(--green)"
                                      : "var(--text-tertiary)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {form.status}
                              </span>
                            </div>
                            <div
                              style={{ display: "flex", gap: 8, marginTop: 20 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ flex: 1, fontSize: 12 }}
                                onClick={() => {
                                  setResponsesFormId(form.id);
                                  setResponsesOpen(true);
                                }}
                              >
                                <BarChart3 size={14} style={{ marginRight: 6 }} />{" "}
                                Responses
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ flex: 1, fontSize: 12 }}
                                onClick={() =>
                                  openFormBuilder(
                                    selectedTeam,
                                    form.id,
                                  )
                                }
                              >
                                <Edit2 size={14} style={{ marginRight: 6 }} />{" "}
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (form.status === "published") {
                                    setCopyingFormId(form.id);
                                  } else {
                                    try {
                                      const pub = await publishFormMut.mutateAsync(
                                        form.id,
                                      );
                                      setPublishedForm(pub);
                                      setPublishSuccessOpen(true);
                                    } catch {
                                      /* surfaced via mutation state */
                                    }
                                  }
                                }}
                                aria-label="Copy / publish link"
                                title={
                                  form.status === "published"
                                    ? "Copy public link"
                                    : "Publish form"
                                }
                              >
                                <Link size={14} />
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Card style={{ padding: 24 }}>Select a team to view details.</Card>
            )}
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <>
            {dashboardQuery.isLoading ? (
              <Card style={{ padding: 24 }}>Loading settings…</Card>
            ) : dashboard?.data && (dashboard.data as SettingsTabData).status ? (
              <SettingsTab data={dashboard.data as SettingsTabData} />
            ) : (
              <Card style={{ padding: 24 }}>No settings available.</Card>
            )}
          </>
        ) : null}
      </main>

      {/* ── Modals ──────────────────────────────────────────── */}

      {/* Create Team */}
      <Modal
        isOpen={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        title="New Organizational Team"
      >
        <div
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: 8,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Input
            label="Team Name"
            placeholder="e.g. Media Team, Hospitality, Security…"
            value={newTeam.name}
            onChange={(e) =>
              setNewTeam((t) => ({ ...t, name: e.target.value }))
            }
          />
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 8,
                color: "var(--text-secondary)",
              }}
            >
              <Info size={14} style={{ opacity: 0.5 }} /> Team Purpose
            </label>
            <textarea
              placeholder="Describe the responsibilities or goals of this team…"
              style={{
                width: "100%",
                minHeight: 100,
                borderRadius: 16,
                border: "1px solid var(--border-light)",
                padding: 16,
                fontSize: 14,
                background: "var(--bg)",
                resize: "vertical",
              }}
              value={newTeam.description}
              onChange={(e) =>
                setNewTeam((t) => ({ ...t, description: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              onClick={() =>
                setNewTeam((t) => ({
                  ...t,
                  is_public_joinable: !t.is_public_joinable,
                }))
              }
              style={{
                padding: 16,
                background: "var(--bg)",
                borderRadius: 16,
                border: "1px solid var(--border-light)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Share size={12} />
                <input
                  type="checkbox"
                  checked={newTeam.is_public_joinable}
                  readOnly
                />
              </div>
              <strong style={{ fontSize: 12, display: "block" }}>
                Public Access
              </strong>
              <p style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                Allow joining via Link or QR.
              </p>
            </div>
            <div
              onClick={() =>
                setNewTeam((t) => ({
                  ...t,
                  allow_member_pin: !t.allow_member_pin,
                }))
              }
              style={{
                padding: 16,
                background: "var(--bg)",
                borderRadius: 16,
                border: "1px solid var(--border-light)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <LogIn size={12} />
                <input
                  type="checkbox"
                  checked={newTeam.allow_member_pin}
                  readOnly
                />
              </div>
              <strong style={{ fontSize: 12, display: "block" }}>
                PIN Security
              </strong>
              <p style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                Require 6-digit PIN for dashboard access.
              </p>
            </div>
          </div>
          {createTeamMut.isError ? (
            <div
              style={{
                padding: 12,
                background: "var(--red-subtle, #fef2f2)",
                border: "1px solid var(--red, #ef4444)",
                borderRadius: 12,
                color: "var(--red, #b91c1c)",
                fontSize: 13,
              }}
            >
              {(createTeamMut.error as ApiError)?.body?.message ??
                "Couldn’t create team."}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Button
              variant="ghost"
              onClick={() => setCreateTeamOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-premium"
              onClick={handleCreateTeamSubmit}
              disabled={!newTeam.name.trim() || createTeamMut.isPending}
            >
              {createTeamMut.isPending ? "Creating…" : "Initialize Team"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add member */}
      <Modal
        isOpen={createMemberOpen}
        onClose={() => setCreateMemberOpen(false)}
        title={`Add member to ${selectedTeam?.name ?? "team"}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newMember.name}
            onChange={(e) =>
              setNewMember((m) => ({ ...m, name: e.target.value }))
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Input
              label="Phone Number"
              placeholder="+234…"
              value={newMember.phone}
              onChange={(e) =>
                setNewMember((m) => ({ ...m, phone: e.target.value }))
              }
            />
            <Input
              label="Email (optional)"
              placeholder="email@example.com"
              value={newMember.email}
              onChange={(e) =>
                setNewMember((m) => ({ ...m, email: e.target.value }))
              }
            />
          </div>
          <Input
            label="6-digit PIN (optional)"
            placeholder="000000"
            maxLength={6}
            value={newMember.pin}
            onChange={(e) =>
              setNewMember((m) => ({
                ...m,
                pin: e.target.value.replace(/[^0-9]/g, ""),
              }))
            }
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={newMember.is_admin}
              onChange={(e) =>
                setNewMember((m) => ({ ...m, is_admin: e.target.checked }))
              }
            />
            Make this member a team admin
          </label>
          {createMemberMut.isError ? (
            <div
              style={{
                padding: 12,
                background: "var(--red-subtle, #fef2f2)",
                border: "1px solid var(--red, #ef4444)",
                borderRadius: 12,
                color: "var(--red, #b91c1c)",
                fontSize: 13,
              }}
            >
              {(createMemberMut.error as ApiError)?.body?.message ??
                "Couldn’t add member."}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Button variant="ghost" onClick={() => setCreateMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              className="btn-premium"
              onClick={handleAddMember}
              disabled={
                !newMember.name.trim() ||
                !newMember.phone.trim() ||
                createMemberMut.isPending
              }
            >
              {createMemberMut.isPending ? "Adding…" : "Complete Registration"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit member */}
      <Modal
        isOpen={editMemberOpen}
        onClose={() => setEditMemberOpen(false)}
        title="Edit User Profile"
      >
        {editingMember ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Full Name"
              value={editingMember.name}
              onChange={(e) =>
                setEditingMember({ ...editingMember, name: e.target.value })
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Input
                label="Phone"
                value={editingMember.phone}
                onChange={(e) =>
                  setEditingMember({ ...editingMember, phone: e.target.value })
                }
              />
              <Input
                label="Email"
                value={editingMember.email ?? ""}
                onChange={(e) =>
                  setEditingMember({ ...editingMember, email: e.target.value })
                }
              />
            </div>
            {updateMemberMut.isError ? (
              <div
                style={{
                  padding: 12,
                  background: "var(--red-subtle, #fef2f2)",
                  border: "1px solid var(--red, #ef4444)",
                  borderRadius: 12,
                  color: "var(--red, #b91c1c)",
                  fontSize: 13,
                }}
              >
                {(updateMemberMut.error as ApiError)?.body?.message ??
                  "Couldn’t save changes."}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 8,
              }}
            >
              <Button variant="ghost" onClick={() => setEditMemberOpen(false)}>
                Cancel
              </Button>
              <Button
                className="btn-premium"
                onClick={handleUpdateMember}
                disabled={updateMemberMut.isPending}
              >
                {updateMemberMut.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* User actions */}
      <Modal
        isOpen={userActionOpen}
        onClose={() => setUserActionOpen(false)}
        title={
          userActionMember ? `Manage ${userActionMember.name}` : "User Actions"
        }
      >
        {userActionMember ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 8,
                padding: 16,
                background: "var(--bg)",
                borderRadius: 12,
              }}
            >
              <div
                className="user-avatar-tiny"
                style={{ width: 48, height: 48, fontSize: 18 }}
              >
                {userActionMember.name[0]}
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700 }}>
                  {userActionMember.name}
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  {userActionMember.roles.join(", ")} · {userActionMember.status}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              fullWidth
              style={{ justifyContent: "flex-start", gap: 12 }}
              onClick={() => {
                setEditingMember(userActionMember);
                setEditMemberOpen(true);
                setUserActionOpen(false);
              }}
            >
              <Edit2 size={18} /> Edit User Details
            </Button>
            <Button
              variant="outline"
              fullWidth
              style={{ justifyContent: "flex-start", gap: 12, color: "var(--red)" }}
              onClick={() => {
                setUserActionOpen(false);
                void handleRemoveMember(userActionMember);
              }}
            >
              <Trash2 size={18} /> Remove User from Location
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* Team settings */}
      <Modal
        isOpen={teamSettingsOpen}
        onClose={() => setTeamSettingsOpen(false)}
        title={`${teamById.get(teamSettingsId ?? "")?.name ?? "Team"} Settings`}
      >
        {teamSettingsId ? (
          <TeamSettingsForm
            team={teamById.get(teamSettingsId)!}
            isSaving={updateTeamMut.isPending}
            error={updateTeamMut.error as ApiError | null}
            onSave={async (input) => {
              await updateTeamMut.mutateAsync({
                teamId: teamSettingsId,
                input,
              });
              setTeamSettingsOpen(false);
            }}
            onClose={() => setTeamSettingsOpen(false)}
          />
        ) : null}
      </Modal>

      {/* Team QR */}
      <Modal
        isOpen={teamQrOpen && teamQrId !== null}
        onClose={() => setTeamQrOpen(false)}
        title={`${teamById.get(teamQrId ?? "")?.name ?? "Team"} Invite`}
      >
        {teamQrId ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              padding: "12px 0",
            }}
          >
            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 24,
                border: "1px solid var(--border-light)",
              }}
            >
              <QRCodeSVG
                id="group-invite-qr"
                value={teamJoinUrl(teamById.get(teamQrId)!)}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                Join {teamById.get(teamQrId)?.name} Team
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  maxWidth: 280,
                }}
              >
                People can scan this code to register and join this team.
              </p>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: 12,
                marginTop: 12,
              }}
            >
              <Button
                variant="outline"
                fullWidth
                onClick={() =>
                  downloadSvgAsPng(
                    "group-invite-qr",
                    `${teamById.get(teamQrId)?.name.toLowerCase()}-team-qr.png`,
                  )
                }
              >
                <Download size={18} /> Download QR
              </Button>
              <Button
                className="btn-premium"
                fullWidth
                onClick={() => {
                  const url = teamJoinUrl(teamById.get(teamQrId)!);
                  void navigator.clipboard.writeText(url).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                <Copy size={18} /> {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Form Builder */}
      <Modal
        isOpen={formBuilderOpen}
        onClose={() => {
          setFormBuilderOpen(false);
          setPreviewMode(null);
        }}
        title={
          previewMode
            ? `Preview: ${formConfig.title || "Untitled Form"}`
            : `Form Builder: ${teamById.get(selectedTeamId ?? "")?.name ?? ""}`
        }
        size="full"
      >
        <FormBuilder
          config={formConfig}
          fields={formFields}
          previewMode={previewMode}
          isSaving={formsBusy}
          error={
            (createFormMut.error as ApiError | null) ??
            (updateFormMut.error as ApiError | null) ??
            (publishFormMut.error as ApiError | null)
          }
          onConfigChange={setFormConfig}
          onFieldsChange={setFormFields}
          onAddField={() => setFieldSelectorOpen(true)}
          onPreview={() => setPreviewMode("mobile")}
          onExitPreview={() => setPreviewMode(null)}
          onSaveDraft={() => handleSaveForm(false)}
          onPublish={() => handleSaveForm(true)}
        />
      </Modal>

      {/* Field selector */}
      <Modal
        isOpen={fieldSelectorOpen}
        onClose={() => setFieldSelectorOpen(false)}
        title="Add New Field"
        size="xl"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: 8,
                }}
              >
                {cat}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 8,
                }}
              >
                {FIELD_TYPES.filter((t) => t.cat === cat).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAddField(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      border: "1px solid var(--border-light)",
                      borderRadius: 12,
                      background: "white",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--blue-subtle)",
                        color: "var(--blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <t.icon size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 13, display: "block" }}>
                        {t.label}
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {t.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Publish success */}
      <Modal
        isOpen={publishSuccessOpen}
        onClose={() => setPublishSuccessOpen(false)}
        title="Publication Successful!"
      >
        {publishedForm ? (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: "var(--green-subtle)",
                color: "var(--green)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={48} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>Form is Live!</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: 15 }}>
              Your form is now ready for distribution.
            </p>
            <div
              style={{
                background: "var(--bg)",
                padding: 16,
                borderRadius: 16,
                border: "1px solid var(--border-light)",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Public Form Link
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  readOnly
                  value={publishedForm.public_url}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      publishedForm.public_url,
                    )
                  }
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 24,
                border: "1px solid var(--border-light)",
              }}
            >
              <QRCodeSVG
                id="published-qr-svg"
                value={publishedForm.public_url}
                size={200}
                level="H"
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                className="btn-premium"
                onClick={() =>
                  downloadSvgAsPng(
                    "published-qr-svg",
                    `${publishedForm.title.toLowerCase().replace(/\s+/g, "-")}-qr.png`,
                  )
                }
                style={{ gap: 8 }}
              >
                <Download size={18} /> Download QR
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(publishedForm.public_url, "_blank")}
                style={{ gap: 8 }}
              >
                <ExternalLink size={18} /> Preview
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Responses */}
      <Modal
        isOpen={responsesOpen}
        onClose={() => {
          setResponsesOpen(false);
          setResponsesFormId(null);
        }}
        title={`Responses: ${responsesFormQuery.data?.title ?? "Form"}`}
        size="full"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900 }}>Submission Data</h3>
              <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
                Analyze responses collected for this form.
              </p>
            </div>
            {responsesFormQuery.data ? (
              <Button
                variant="outline"
                onClick={() => {
                  const formId = responsesFormQuery.data?.id;
                  if (!formId) return;
                  setExportError(null);
                  void downloadCsv(
                    exportFormResponsesUrl(formId),
                    `form-${formId}-responses.csv`,
                  ).catch((err: unknown) => {
                    setExportError(
                      err instanceof ApiError
                        ? err.body.message
                        : "Couldn’t download form responses.",
                    );
                  });
                }}
                style={{ gap: 8 }}
              >
                <Download size={18} /> Export CSV
              </Button>
            ) : null}
          </div>
          <Card style={{ overflow: "hidden" }}>
            {responsesQuery.isLoading || responsesFormQuery.isLoading ? (
              <div style={{ padding: 24 }}>Loading responses…</div>
            ) : (responsesQuery.data?.data?.length ?? 0) === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                No responses yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="location-users-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      {(responsesFormQuery.data?.fields ?? []).map((f) => (
                        <th key={f.key}>{f.label || "Untitled Field"}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(responsesQuery.data?.data ?? []).map((r) => (
                      <tr key={r.id}>
                        <td
                          style={{ fontSize: 12, color: "var(--text-tertiary)" }}
                        >
                          {new Date(r.submitted_at).toLocaleString()}
                        </td>
                        {(responsesFormQuery.data?.fields ?? []).map((f) => (
                          <td key={f.key} style={{ fontSize: 13 }}>
                            {String(r.answers[f.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Modal>

      {/* Network import */}
      <Modal
        isOpen={networkImportOpen}
        onClose={() => {
          setNetworkImportOpen(false);
          setNetworkSourceLocationId(null);
        }}
        title="Network Import"
      >
        <NetworkImportPanel
          currentLocationId={locationId}
          kind={networkImportKind}
          sourceLocationId={networkSourceLocationId}
          locations={allLocationsQuery.data?.data ?? []}
          onPickLocation={(id) => setNetworkSourceLocationId(id)}
          onReset={() => setNetworkSourceLocationId(null)}
          onClose={() => {
            setNetworkImportOpen(false);
            setNetworkSourceLocationId(null);
          }}
        />
      </Modal>
    </div>
  );
}

// Helper component for team settings (kept local to avoid prop-drilling)
function TeamSettingsForm({
  team,
  isSaving,
  error,
  onSave,
  onClose,
}: {
  team: Team;
  isSaving: boolean;
  error: ApiError | null;
  onSave: (input: {
    name?: string;
    description?: string;
    is_public_joinable?: boolean;
    allow_member_pin?: boolean;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(team.name);
  const [description, setDescription] = React.useState(team.description ?? "");
  const [allowJoin, setAllowJoin] = React.useState(team.is_public_joinable);
  const [allowPin, setAllowPin] = React.useState(team.allow_member_pin);

  const isAdmin = team.name === "Admin";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isAdmin ? (
        <div
          style={{
            padding: 16,
            background: "var(--blue-subtle)",
            borderRadius: 12,
            border: "1px solid var(--blue-light)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            color: "var(--blue)",
          }}
        >
          <Shield size={20} />
          <div>
            <strong style={{ fontSize: 14, display: "block" }}>
              Protected Admin Team
            </strong>
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Admin roles cannot be joined via public links.
            </p>
          </div>
        </div>
      ) : null}
      <Input
        label="Team Name"
        value={name}
        disabled={isAdmin}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <label
          style={{
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
            display: "block",
            color: "var(--text-secondary)",
          }}
        >
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            minHeight: 80,
            borderRadius: 12,
            border: "1px solid var(--border-light)",
            padding: 12,
            fontSize: 14,
            background: "var(--bg)",
          }}
        />
      </div>
      {!isAdmin ? (
        <ToggleRow
          title="Enable Joining"
          subtitle="Allow people to join this group via Link/QR"
          value={allowJoin}
          onChange={setAllowJoin}
        />
      ) : null}
      <ToggleRow
        title="Member PIN Setup"
        subtitle="Allow members to set up their own 6-digit PIN"
        value={allowPin}
        onChange={setAllowPin}
      />
      {error ? (
        <div
          style={{
            padding: 12,
            background: "var(--red-subtle, #fef2f2)",
            border: "1px solid var(--red, #ef4444)",
            borderRadius: 12,
            color: "var(--red, #b91c1c)",
            fontSize: 13,
          }}
        >
          {error.body?.message ?? "Couldn’t save team settings."}
        </div>
      ) : null}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="btn-premium"
          disabled={isSaving || isAdmin}
          onClick={() =>
            onSave({
              name,
              description,
              is_public_joinable: allowJoin,
              allow_member_pin: allowPin,
            })
          }
        >
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        background: "var(--bg)",
        borderRadius: 12,
      }}
    >
      <div>
        <strong style={{ display: "block", fontSize: 14 }}>{title}</strong>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {subtitle}
        </span>
      </div>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

function NetworkImportPanel({
  currentLocationId,
  kind,
  sourceLocationId,
  locations,
  onPickLocation,
  onReset,
  onClose,
}: {
  currentLocationId: string;
  kind: "group" | "form";
  sourceLocationId: string | null;
  locations: Array<{ id: string; name: string }>;
  onPickLocation: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const sourceTeamsQuery = useLocationTeams(sourceLocationId ?? "");
  const sourceTeams = sourceTeamsQuery.data?.data ?? [];
  const sourceLocation = locations.find((l) => l.id === sourceLocationId);
  const cloneTeamMut = useCloneTeam();

  const others = locations.filter((l) => l.id !== currentLocationId);

  if (!sourceLocationId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Select Source Location</h3>
        {others.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)" }}>No other locations.</p>
        ) : (
          others.map((loc) => (
            <Card
              key={loc.id}
              style={{
                padding: 16,
                cursor: "pointer",
                border: "1px solid var(--border-light)",
              }}
              onClick={() => onPickLocation(loc.id)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ display: "block", fontSize: 15 }}>
                    {loc.name}
                  </strong>
                </div>
                <ChevronRight size={18} color="var(--text-tertiary)" />
              </div>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          style={{ gap: 6, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>
          {sourceLocation?.name}
        </span>
      </div>
      {sourceTeamsQuery.isLoading ? (
        <p>Loading teams…</p>
      ) : sourceTeams.length === 0 ? (
        <p style={{ color: "var(--text-tertiary)" }}>No teams at this location.</p>
      ) : (
        sourceTeams.map((t) => (
          <Card
            key={t.id}
            style={{
              padding: 12,
              cursor: "pointer",
              border: "1px solid var(--border-light)",
            }}
            onClick={async () => {
              try {
                await cloneTeamMut.mutateAsync({
                  // The destination team id is informational; the backend
                  // will create a new team in the *current* location.
                  teamId: t.id,
                  input: {
                    source_location_id: t.location_id,
                    source_team_name: t.name,
                    import_members: false,
                    import_forms: kind === "form",
                  },
                });
                onClose();
              } catch {
                /* surfaced via mutation state */
              }
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 14 }}>{t.name}</strong>
              <ChevronRight size={16} color="var(--text-tertiary)" />
            </div>
          </Card>
        ))
      )}
      {cloneTeamMut.isError ? (
        <div
          style={{
            padding: 12,
            background: "var(--red-subtle, #fef2f2)",
            border: "1px solid var(--red, #ef4444)",
            borderRadius: 12,
            color: "var(--red, #b91c1c)",
            fontSize: 13,
          }}
        >
          {(cloneTeamMut.error as ApiError)?.body?.message ??
            "Couldn’t import team."}
        </div>
      ) : null}
    </div>
  );
}

function FormBuilder({
  config,
  fields,
  previewMode,
  isSaving,
  error,
  onConfigChange,
  onFieldsChange,
  onAddField,
  onPreview,
  onExitPreview,
  onSaveDraft,
  onPublish,
}: {
  config: { title: string; description: string; status: FormStatus };
  fields: FormField[];
  previewMode: "mobile" | "desktop" | null;
  isSaving: boolean;
  error: ApiError | null;
  onConfigChange: (next: typeof config) => void;
  onFieldsChange: (next: FormField[]) => void;
  onAddField: () => void;
  onPreview: () => void;
  onExitPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  if (previewMode) {
    return (
      <div className="form-preview-overlay fade-in" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <strong>Preview</strong>
          <Button variant="ghost" size="sm" onClick={onExitPreview}>
            Exit Preview
          </Button>
        </div>
        <Card style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{config.title}</h1>
          {config.description ? (
            <p style={{ color: "var(--text-tertiary)", marginTop: 8 }}>
              {config.description}
            </p>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            {fields.map((f) => (
              <PreviewField key={f.key} field={f} />
            ))}
          </div>
          <Button className="btn-premium" fullWidth style={{ marginTop: 24 }}>
            Submit Form
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="builder-interface fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          borderRadius: 16,
          background: "var(--bg)",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="form-title-input-ghost"
          placeholder="Untitled Form"
          value={config.title}
          onChange={(e) => onConfigChange({ ...config, title: e.target.value })}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontSize: 18,
            fontWeight: 800,
            outline: "none",
          }}
        />
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          {config.status === "draft" ? "Draft" : "Published"} • Auto-saved
        </span>
        <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={isSaving}>
          Save
        </Button>
        <Button
          className="btn-premium"
          size="sm"
          onClick={onPublish}
          disabled={isSaving || fields.length === 0}
          style={{ opacity: fields.length === 0 ? 0.5 : 1 }}
        >
          Publish
        </Button>
        <Button variant="ghost" size="sm" onClick={onPreview} aria-label="Preview">
          <Eye size={18} />
        </Button>
      </div>
      <textarea
        placeholder="Add an optional description for this form…"
        value={config.description}
        onChange={(e) =>
          onConfigChange({ ...config, description: e.target.value })
        }
        style={{
          width: "100%",
          minHeight: 60,
          borderRadius: 12,
          border: "1px solid var(--border-light)",
          padding: 12,
          fontSize: 14,
          background: "var(--bg)",
          resize: "vertical",
        }}
      />
      {error ? (
        <div
          style={{
            padding: 12,
            background: "var(--red-subtle, #fef2f2)",
            border: "1px solid var(--red, #ef4444)",
            borderRadius: 12,
            color: "var(--red, #b91c1c)",
            fontSize: 13,
          }}
        >
          {error.body?.message ?? "Couldn’t save the form."}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.length === 0 ? (
          <Card
            className="glass-morphism"
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <Layout size={32} style={{ opacity: 0.5 }} />
            <h3 style={{ fontWeight: 800, marginTop: 12 }}>Your form is empty</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>Add your first field below.</p>
            <Button
              className="btn-premium"
              onClick={onAddField}
              style={{ marginTop: 16, gap: 8 }}
            >
              <Plus size={16} /> Add Your First Field
            </Button>
          </Card>
        ) : (
          fields.map((field, idx) => (
            <FieldCard
              key={field.key}
              field={field}
              onChange={(next) => {
                const arr = [...fields];
                arr[idx] = next;
                onFieldsChange(arr);
              }}
              onDuplicate={() => {
                const arr = [...fields];
                arr.splice(idx + 1, 0, { ...field, key: `f_${Math.random().toString(36).slice(2, 9)}` });
                onFieldsChange(arr);
              }}
              onDelete={() => {
                onFieldsChange(fields.filter((f) => f.key !== field.key));
              }}
            />
          ))
        )}
        {fields.length > 0 ? (
          <Button
            className="btn-premium"
            onClick={onAddField}
            style={{ alignSelf: "flex-start", gap: 8 }}
          >
            <Plus size={16} /> Add Field
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function FieldCard({
  field,
  onChange,
  onDuplicate,
  onDelete,
}: {
  field: FormField;
  onChange: (next: FormField) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const meta = FIELD_TYPES.find((t) => t.id === field.type);
  return (
    <Card
      style={{
        padding: 16,
        border: "1px solid var(--border-main)",
        borderRadius: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
          }}
        >
          {meta ? <meta.icon size={14} /> : null}
          <span>{meta?.label ?? field.type}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Button variant="ghost" size="sm" onClick={onDuplicate} aria-label="Duplicate">
            <Layers size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete">
            <Trash size={14} />
          </Button>
        </div>
      </div>
      <Input
        placeholder="Question title"
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
      />
      {fieldNeedsOptions(field.type ?? "text") ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {(field.options ?? []).map((opt, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {field.type === "single_choice" ? (
                <Circle size={14} />
              ) : (
                <CheckSquare size={14} />
              )}
              <input
                type="text"
                value={opt.label}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const next = [...(field.options ?? [])];
                  next[i] = { value: e.target.value, label: e.target.value };
                  onChange({ ...field, options: next });
                }}
                style={{
                  flex: 1,
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 13,
                }}
              />
              <button
                onClick={() => {
                  const next = (field.options ?? []).filter(
                    (_: unknown, idx: number) => idx !== i,
                  );
                  onChange({ ...field, options: next });
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--red, #ef4444)",
                  cursor: "pointer",
                }}
                aria-label="Remove option"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = [
                ...(field.options ?? []),
                { value: `Option ${(field.options?.length ?? 0) + 1}`, label: `Option ${(field.options?.length ?? 0) + 1}` },
              ];
              onChange({ ...field, options: next });
            }}
            style={{ alignSelf: "flex-start", gap: 4, fontSize: 12 }}
          >
            <Plus size={12} /> Add Option
          </Button>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          fontSize: 12,
          color: "var(--text-tertiary)",
        }}
      >
        <label
          style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          Required
        </label>
      </div>
    </Card>
  );
}

function PreviewField({ field }: { field: FormField }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600 }}>
        {field.label || "Untitled"}{" "}
        {field.required ? <span style={{ color: "var(--red, #ef4444)" }}>*</span> : null}
      </label>
      {field.type === "text" ? <Input placeholder="Type here" readOnly /> : null}
      {field.type === "multiline" ? (
        <textarea
          placeholder="Type here…"
          readOnly
          style={{
            width: "100%",
            minHeight: 80,
            border: "1px solid var(--border-light)",
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
          }}
        />
      ) : null}
      {field.type === "number" ? <Input type="number" placeholder="0" readOnly /> : null}
      {field.type === "email" ? <Input type="email" placeholder="name@example.com" readOnly /> : null}
      {field.type === "phone" ? <Input type="tel" placeholder="+1…" readOnly /> : null}
      {field.type === "single_choice" || field.type === "multi_choice" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {(field.options ?? []).map((o, i) => (
            <label
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
              <input
                type={field.type === "single_choice" ? "radio" : "checkbox"}
                readOnly
              />
              {o.label}
            </label>
          ))}
        </div>
      ) : null}
      {field.type === "dropdown" ? (
        <select
          disabled
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border-light)",
            background: "var(--bg)",
            fontSize: 14,
          }}
        >
          <option>Select an option…</option>
          {(field.options ?? []).map((o, i) => (
            <option key={i}>{o.label}</option>
          ))}
        </select>
      ) : null}
      {field.type === "date" ? (
        <Input type="date" readOnly />
      ) : null}
      {field.type === "rating" ? (
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={20} color="var(--border-light)" />
          ))}
        </div>
      ) : null}
      {field.type === "signature" ? (
        <div
          style={{
            height: 80,
            background: "var(--bg)",
            border: "1px dashed var(--border-light)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          Draw your signature here…
        </div>
      ) : null}
      {field.type === "photo" ? (
        <div
          style={{
            padding: 24,
            border: "2px dashed var(--border-light)",
            borderRadius: 12,
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: 13,
          }}
        >
          Drop a photo here
        </div>
      ) : null}
      {field.type === "barcode" ? (
        <Input placeholder="Scan a barcode" readOnly />
      ) : null}
      {field.type === "address" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Input placeholder="Street" readOnly />
          <div style={{ display: "flex", gap: 8 }}>
            <Input placeholder="City" readOnly />
            <Input placeholder="Zip" readOnly />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function LocationPerformancePage() {
  return (
    <Suspense fallback={<div>Loading location dashboard…</div>}>
      <LocationDashboardContent />
    </Suspense>
  );
}
