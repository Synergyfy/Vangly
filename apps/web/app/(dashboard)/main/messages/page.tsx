"use client";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import {
  Send, Users, History,
  ChevronRight, Plus, Smartphone,
  Clock, Type, MapPin,
  CheckCircle2,
  X, LayoutTemplate, Wallet,
  ArrowLeft, Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/services/auth";
import { useWalletBalance } from "@/services/wallet";
import {
  useLocationsList,
  useLocationTeams,
  useLocationMembers,
} from "@/services/manage-organization";
import {
  useMessageTemplates,
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useSendMessage,
  useMessageHistory,
} from "@/services/messages";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { isValidMessageBody, isValidTemplateName } from "@/lib/forms/validators";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "./messaging.css";

const HIGH_RISK_WORDS = [
  "urgent", "immediate action", "click here", "prize", "won", "reward",
  "verify", "account blocked", "password", "congratulations", "gift", "claim",
];

const PLACEHOLDER_VARS = ["name", "organization", "location", "date"];

function MessagingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const balanceQuery = useWalletBalance();
  const locationsQuery = useLocationsList({ page: 1, per_page: 100 });
  const sendMessage = useSendMessage();
  const templatesQuery = useMessageTemplates();
  const createTemplate = useCreateMessageTemplate();
  const deleteTemplate = useDeleteMessageTemplate();
  const historyQuery = useMessageHistory({ page: 1, page_size: 20 });

  const initialView = ((): 'dashboard' | 'history' | 'templates' => {
    if (typeof window === "undefined") return 'dashboard';
    const sp = new URLSearchParams(window.location.search);
    const view = sp.get("view");
    if (view === "history") return 'history';
    if (view === "templates") return 'templates';
    return 'dashboard';
  })();

  const [currentView, setCurrentView] = useState<'dashboard' | 'flow' | 'history' | 'templates' | 'details'>(initialView);
  const [step, setStep] = useState(1);

  const [showHighRiskModal, setShowHighRiskModal] = useState(false);

  const [recipientType, setRecipientType] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [manualPhones, setManualPhones] = useState<string>("");
  const [filters, setFilters] = useState<string[]>(['all']);
  const [message, setMessage] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [showSendSuccess, setShowSendSuccess] = useState(false);
  const [sendSuccessInfo, setSendSuccessInfo] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);

  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  const { errors, setError, clearAll } = useFieldErrors();
  const isSending = sendMessage.isPending;

  const locations = useMemo(
    () => locationsQuery.data?.data ?? [],
    [locationsQuery.data?.data],
  );
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );
  const teamsQuery = useLocationTeams(
    recipientType === "team" ? selectedLocationId ?? undefined : undefined,
    { page: 1, per_page: 100 },
  );
  const teams = useMemo(
    () => teamsQuery.data?.data ?? [],
    [teamsQuery.data?.data],
  );

  const membersQuery = useLocationMembers(
    selectedLocationId ?? undefined,
    { page: 1, per_page: 500 },
  );
  const locationMembers = useMemo(
    () => membersQuery.data?.data ?? [],
    [membersQuery.data?.data],
  );

  const availableCredits = balanceQuery.data?.balance ?? user?.credits ?? 0;

  const charCount = message.length;
  const smsUnitsPerMsg = Math.max(1, Math.ceil(charCount / 160));

  const recipients = useMemo(() => {
    if (recipientType === "location" && selectedLocationId) {
      return locationMembers.map((m) => ({
        phone: m.phone,
        name: m.name,
      }));
    }
    if (recipientType === "manual" && manualPhones.trim()) {
      return manualPhones
        .split(/[\n,;\s]+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((phone) => ({ phone }));
    }
    return [];
  }, [recipientType, selectedLocationId, locationMembers, manualPhones]);

  const estimatedRecipients = recipients.length;
  const totalUnitsNeeded = smsUnitsPerMsg * estimatedRecipients;
  const hasLowCredit = totalUnitsNeeded > availableCredits;

  const isHighRisk = HIGH_RISK_WORDS.some((w) =>
    message.toLowerCase().includes(w),
  );

  const handleStartFlow = () => {
    setCurrentView('flow');
    setStep(1);
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => {
    if (currentView === 'details') {
      setCurrentView('history');
      return;
    }
    if (currentView === 'flow') {
      if (step === 1) setCurrentView('dashboard');
      else if (step === 2 && (recipientType === 'organization' || recipientType === 'specific' || recipientType === 'manual' || recipientType === 'upload')) setStep(1);
      else setStep((prev) => prev - 1);
      return;
    }
    setCurrentView('dashboard');
  };

  const insertVariable = (variable: string) => {
    setMessage((prev) => prev + `{${variable}}`);
  };

  const applyTemplate = (tplId: string) => {
    if (tplId === "none") return;
    const tpl = (templatesQuery.data ?? []).find((t) => t.id === tplId);
    if (tpl) setMessage(tpl.body);
  };

  const handleSend = async () => {
    clearAll();
    if (recipients.length === 0) {
      setError("recipients", "Pick at least one recipient before sending.");
      return;
    }
    if (!isValidMessageBody(message)) {
      setError("message", "Enter a message up to 1600 characters.");
      return;
    }

    try {
      const result = await sendMessage.mutateAsync({
        recipients,
        body: message,
      });
      setSendSuccessInfo({
        sent: result.sent,
        failed: result.failed,
        total: result.total,
      });
      setShowSendSuccess(true);
      setStep(6);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not send your message."));
    }
  };

  const handleCreateTemplate = async () => {
    clearAll();
    if (!isValidTemplateName(newTemplateName)) {
      setError("newTemplateName", "Use 3 to 80 characters for the template name.");
      return;
    }
    if (!isValidMessageBody(newTemplateBody)) {
      setError("newTemplateBody", "Enter a body up to 1600 characters.");
      return;
    }
    try {
      await createTemplate.mutateAsync({
        name: newTemplateName.trim(),
        body: newTemplateBody,
        channel: "sms",
        mode: "flexible",
        scope: "organization",
      });
      setNewTemplateName("");
      setNewTemplateBody("");
      setIsCreateTemplateOpen(false);
      toast.success(`Template "${newTemplateName.trim()}" created.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save your template."));
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success(`Template "${name}" deleted.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete your template."));
    }
  };

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Communication Hub</div>
          <h1>Messaging</h1>
          <p>Manage your communications and reach your community instantly.</p>
        </div>

        <div
          className="sms-balance-card glass-morphism"
          style={{
            padding: "16px 20px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            border: "1px solid var(--border-light)",
          }}
        >
          <div className="balance-info">
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Credits
            </h3>
            <div
              className="balance-amount"
              style={{ fontSize: "20px", fontWeight: 800 }}
            >
              {balanceQuery.isLoading ? "—" : availableCredits.toLocaleString()}
            </div>
          </div>
          <Button
            onClick={() => router.push('/main/wallet')}
            className="btn-premium"
            size="sm"
          >
            Top Up
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="messaging-actions-hub-grid">
          <Card className="msg-hub-card blue" onClick={handleStartFlow}>
            <div className="msg-hub-icon">
              <Send size={24} />
            </div>
            <strong>New Msg</strong>
          </Card>
          <Card
            className="msg-hub-card purple"
            onClick={() => setCurrentView('templates')}
          >
            <div className="msg-hub-icon">
              <LayoutTemplate size={24} />
            </div>
            <strong>Templates</strong>
          </Card>
          <Card
            className="msg-hub-card orange"
            onClick={() => setCurrentView('history')}
          >
            <div className="msg-hub-icon">
              <History size={24} />
            </div>
            <strong>History</strong>
          </Card>
        </div>

        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 800 }}>Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('history')}>
            View All
          </Button>
        </div>

        {historyQuery.isLoading ? (
          <Card style={{ padding: "24px", textAlign: "center" }}>Loading activity…</Card>
        ) : (historyQuery.data?.data ?? []).length === 0 ? (
          <Card style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)" }}>
            <History size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
            <p>Your sent broadcasts will appear here.</p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(historyQuery.data?.data ?? []).slice(0, 3).map((h) => (
              <Card key={h.id} style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "13px" }}>{h.to_phone}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {new Date(h.at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {h.body_preview}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  const renderFlow = () => {
    switch (step) {
      case 1:
        return (
          <div className="messaging-hub">
            <div className="wizard-header">
              <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                <ArrowLeft size={18} /> Back to Hub
              </Button>
              <h1>Who do you want to message?</h1>
              <p>Select your target audience for this communication.</p>
            </div>
            <div className="recipient-cards-grid">
              {[
                { id: 'organization', title: 'Entire Organization', desc: 'Send to every contact in your network.', icon: <Users size={32} /> },
                { id: 'location', title: 'By Location', desc: 'Target people at a specific campus or office.', icon: <MapPin size={32} /> },
                { id: 'team', title: 'By Team', desc: 'Message a specific outreach team.', icon: <Users size={32} /> },
                { id: 'manual', title: 'Type Phone Numbers', desc: 'Enter numbers separated by commas.', icon: <Type size={32} /> },
              ].map((type) => (
                <div
                  key={type.id}
                  className={`recipient-type-card ${recipientType === type.id ? 'active' : ''}`}
                  onClick={() => {
                    setRecipientType(type.id);
                    handleNext();
                  }}
                >
                  <div className="recipient-icon-bg">{type.icon}</div>
                  <div className="recipient-info">
                    <h3>{type.title}</h3>
                    <p>{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        if (recipientType === 'location') {
          return (
            <div className="messaging-hub">
              <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <h1>Select Location</h1>
                <p>Choose the campus you want to message.</p>
              </div>
              {locationsQuery.isLoading ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>Loading locations…</Card>
              ) : locationsQuery.isError ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>
                  <p>Could not load locations.</p>
                  <Button size="sm" onClick={() => locationsQuery.refetch()}>Retry</Button>
                </Card>
              ) : locations.length === 0 ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>
                  <p>No locations yet.</p>
                </Card>
              ) : (
                <div className="recipient-cards-grid">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className={`recipient-type-card ${selectedLocationId === loc.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        handleNext();
                      }}
                    >
                      <div className="recipient-icon-bg"><MapPin size={32} /></div>
                      <div className="recipient-info">
                        <h3>{loc.name}</h3>
                        <p>
                          {loc.stats?.members ?? 0} members • {loc.stats?.teams ?? 0} teams
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        if (recipientType === 'team') {
          if (!selectedLocationId) {
            return (
              <div className="messaging-hub">
                <div className="wizard-header">
                  <Button variant="ghost" onClick={() => setStep(1)} style={{ marginBottom: '16px' }}>
                    <ArrowLeft size={18} /> Back
                  </Button>
                  <h1>Select Location First</h1>
                  <p>Choose the location that contains your team.</p>
                </div>
                {locationsQuery.isLoading ? (
                  <Card style={{ padding: "32px", textAlign: "center" }}>Loading locations…</Card>
                ) : (
                  <div className="recipient-cards-grid">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        className="recipient-type-card"
                        onClick={() => setSelectedLocationId(loc.id)}
                      >
                        <div className="recipient-icon-bg"><MapPin size={32} /></div>
                        <div className="recipient-info">
                          <h3>{loc.name}</h3>
                          <p>{loc.stats?.teams ?? 0} teams</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div className="messaging-hub">
              <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <h1>Select Team</h1>
                <p>Choose the specific team within your organization.</p>
              </div>
              {teamsQuery.isLoading ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>Loading teams…</Card>
              ) : teamsQuery.isError ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>
                  <p>Could not load teams.</p>
                  <Button size="sm" onClick={() => teamsQuery.refetch()}>Retry</Button>
                </Card>
              ) : teams.length === 0 ? (
                <Card style={{ padding: "32px", textAlign: "center" }}>
                  <p>No teams at this location yet.</p>
                </Card>
              ) : (
                <div className="recipient-cards-grid">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`recipient-type-card ${selectedTeamId === team.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        handleNext();
                      }}
                    >
                      <div className="recipient-icon-bg"><Users size={32} /></div>
                      <div className="recipient-info">
                        <h3>{team.name}</h3>
                        <p>{team.member_count} members • {team.form_count} forms</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        if (recipientType === 'manual') {
          return (
            <div className="messaging-hub">
              <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <h1>Type Phone Numbers</h1>
                <p>Enter numbers separated by commas or new lines. E.164 format preferred.</p>
              </div>
              <Card style={{ padding: "24px" }}>
                <textarea
                  className="input-field textarea-field"
                  rows={6}
                  placeholder="+2348012345678, +2348098765432"
                  value={manualPhones}
                  onChange={(e) => {
                    setManualPhones(e.target.value);
                    if (errors["manualPhones"]) clearAll();
                  }}
                />
                {errors["manualPhones"] && (
                  <p className="input-error-text" style={{ marginTop: "8px" }}>
                    {errors["manualPhones"]}
                  </p>
                )}
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "8px" }}>
                  {recipients.length} number{recipients.length === 1 ? "" : "s"} detected.
                </p>
                <div style={{ marginTop: "16px" }}>
                  <Button
                    className="btn-premium"
                    size="lg"
                    onClick={handleNext}
                    disabled={recipients.length === 0}
                  >
                    Continue to Message <ChevronRight size={18} style={{ marginLeft: "8px" }} />
                  </Button>
                </div>
              </Card>
            </div>
          );
        }
        handleNext();
        return null;

      case 3:
        return (
          <div className="messaging-hub">
            <div className="wizard-header">
              <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                <ArrowLeft size={18} /> Back
              </Button>
              <h1>Refine Your List</h1>
              <p>Apply filters to target specific people within your selection.</p>
            </div>
            <Card style={{ padding: "32px", borderRadius: "24px", textAlign: "center", border: "1px solid var(--ms-border)" }}>
              <div className="filter-chips" style={{ justifyContent: "center" }}>
                {['All Contacts', 'New Contacts', 'Attended Recently', 'Uncontacted', 'Regular Members'].map((f) => (
                  <div
                    key={f}
                    className={`filter-chip ${filters.includes(f) ? 'active' : ''}`}
                    onClick={() =>
                      setFilters((prev) =>
                        prev.includes(f)
                          ? prev.filter((x) => x !== f)
                          : [...prev, f],
                      )
                    }
                  >
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "40px" }}>
                <Button className="btn-premium" size="lg" onClick={handleNext}>
                  Continue to Message <ChevronRight size={18} style={{ marginLeft: "8px" }} />
                </Button>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="messaging-hub">
            <div className="wizard-header" style={{ textAlign: "left", marginBottom: "24px" }}>
              <Button variant="ghost" onClick={handleBack} style={{ marginBottom: "16px" }}>
                <ArrowLeft size={18} /> Back
              </Button>
              <h1>Compose Your Message</h1>
            </div>

            <div className="composer-layout">
              <div className="composer-main">
                <div style={{ marginBottom: "24px" }}>
                  <Input
                    label="Internal Message Title"
                    placeholder="e.g. Sunday Service Reminder"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    disabled={isSending}
                  />
                </div>

                <div className="composer-toolbar-header">
                  <label>Message Body</label>
                  <div style={{ position: "relative" }}>
                    <select
                      defaultValue="none"
                      onChange={(e) => applyTemplate(e.target.value)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                      disabled={isSending}
                    >
                      <option value="none">Use Template</option>
                      {(templatesQuery.data ?? []).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" type="button">
                      <LayoutTemplate size={14} style={{ marginRight: "6px" }} /> Use Template
                    </Button>
                  </div>
                </div>

                <textarea
                  className="composer-textarea"
                  placeholder="Start typing your message..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors["message"]) clearAll();
                  }}
                  disabled={isSending}
                />
                {errors["message"] && (
                  <p className="input-error-text" style={{ marginTop: "8px" }}>
                    {errors["message"]}
                  </p>
                )}

                <div className="variable-chips">
                  {PLACEHOLDER_VARS.map((v) => (
                    <div key={v} className="var-chip" onClick={() => insertVariable(v)}>
                      +{v}
                    </div>
                  ))}
                </div>

                <div className="composer-stats-bar">
                  <div className="stat-pill">
                    <Type size={14} /> {charCount} chars
                  </div>
                  <div className="stat-pill">
                    <Smartphone size={14} /> {smsUnitsPerMsg} Unit{smsUnitsPerMsg > 1 ? "s" : ""}
                  </div>
                  <div className="stat-pill primary">
                    <Users size={14} /> {totalUnitsNeeded.toLocaleString()} Total Units
                  </div>
                </div>

                <div className="composer-footer-actions" style={{ marginBottom: "16px" }}>
                  <Button
                    variant="outline"
                    className="mobile-preview-trigger lg:hidden"
                    onClick={() => setShowPreview(true)}
                  >
                    <Smartphone size={18} /> Preview
                  </Button>
                  <Button
                    className="btn-premium"
                    style={{ flex: 1 }}
                    onClick={handleNext}
                    disabled={hasLowCredit || !message || recipients.length === 0}
                  >
                    Review &amp; Send <ChevronRight size={18} style={{ marginLeft: "8px" }} />
                  </Button>
                </div>

                {errors["recipients"] && (
                  <p className="input-error-text" style={{ marginTop: "8px" }}>
                    {errors["recipients"]}
                  </p>
                )}

                <div className="high-risk-inline-warning">
                  <button className="view-risk-tag" onClick={() => setShowHighRiskModal(true)}>View</button>
                  <span className="risk-warning-text">
                    {isHighRisk
                      ? "Message contains high-risk words that may affect delivery."
                      : "Avoid high-risk words to ensure your message is delivered."}
                  </span>
                </div>

                {hasLowCredit && (
                  <Card className="low-credit-warning" style={{ marginTop: "16px" }}>
                    <div className="warning-content">
                      <Wallet size={20} className="text-danger" />
                      <div>
                        <strong>Insufficient Credits</strong>
                        <p>You need {(totalUnitsNeeded - availableCredits).toLocaleString()} more units to send this message.</p>
                      </div>
                    </div>
                    <Button
                      className="btn-buy-mini"
                      onClick={() => router.push(`/main/wallet?topup=${totalUnitsNeeded - availableCredits}`)}
                    >
                      Top Up Now
                    </Button>
                  </Card>
                )}
              </div>

              <div className="phone-preview-container">
                <div className="iphone-frame">
                  <div className="iphone-screen">
                    <div className="iphone-header">
                      <div className="iphone-avatar" />
                      <div className="iphone-contact">Harvite Notifications</div>
                    </div>
                    <div className="chat-content">
                      <div className="chat-timestamp">Today 10:45 AM</div>
                      <div className="sms-bubble sent">
                        {message || "Your message will appear here exactly as your contacts will see it..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showHighRiskModal && (
              <div className="modal-overlay" onClick={() => setShowHighRiskModal(false)}>
                <Card className="high-risk-info-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>High-Risk Words</h3>
                    <button className="close-btn" onClick={() => setShowHighRiskModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <p>Using these words in your SMS may cause it to be flagged by telecom carriers and not delivered:</p>
                  <div className="risk-words-grid">
                    {HIGH_RISK_WORDS.map((w) => (
                      <div key={w} className={`risk-word ${message.toLowerCase().includes(w) ? "detected" : ""}`}>
                        {w}
                      </div>
                    ))}
                  </div>
                  <Button fullWidth className="btn-premium" style={{ marginTop: "24px" }} onClick={() => setShowHighRiskModal(false)}>
                    Got it
                  </Button>
                </Card>
              </div>
            )}

            {showPreview && (
              <div className="mobile-preview-overlay" onClick={() => setShowPreview(false)}>
                <div className="mobile-preview-content" onClick={(e) => e.stopPropagation()}>
                  <div className="close-preview" onClick={() => setShowPreview(false)}>
                    <X size={32} />
                  </div>
                  <div className="iphone-frame">
                    <div className="iphone-screen">
                      <div className="iphone-header">
                        <div className="iphone-avatar" />
                        <div className="iphone-contact">Harvite Notifications</div>
                      </div>
                      <div className="chat-content">
                        <div className="chat-timestamp">Today 10:45 AM</div>
                        <div className="sms-bubble sent">
                          {message || "Start typing to see preview..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="messaging-hub">
            <div className="wizard-header">
              <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}>
                <ArrowLeft size={18} /> Back
              </Button>
              <h1>Final Review</h1>
              <p>Please double-check everything before sending your broadcast.</p>
            </div>

            <div className="review-grid">
              <div className="review-summary-card">
                <div className="summary-item">
                  <span className="summary-label">Target Audience</span>
                  <span className="summary-value">
                    {recipientType === "organization"
                      ? "Entire Organization"
                      : recipientType === "location" && selectedLocation
                        ? selectedLocation.name
                        : recipientType === "team"
                          ? "Selected Team"
                          : recipientType === "manual"
                            ? "Manual Numbers"
                            : "Selected People"}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Recipients</span>
                  <span className="summary-value">
                    {estimatedRecipients.toLocaleString()} contacts
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">SMS Units</span>
                  <span className="summary-value">{smsUnitsPerMsg} units / contact</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Units Required</span>
                  <span className="summary-value" style={{ color: "var(--ms-primary)", fontSize: "20px" }}>
                    {totalUnitsNeeded.toLocaleString()} Units
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Scheduled For</span>
                  <span className="summary-value">Immediate Delivery</span>
                </div>

                <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Button
                    className="btn-premium"
                    fullWidth
                    size="lg"
                    onClick={handleSend}
                    disabled={isSending || hasLowCredit || recipients.length === 0}
                  >
                    <Send size={18} style={{ marginRight: "8px" }} />
                    {isSending ? "Sending..." : "Send Message Now"}
                  </Button>
                  <Button variant="outline" fullWidth size="lg" disabled>
                    <Clock size={18} style={{ marginRight: "8px" }} /> Schedule for Later
                  </Button>
                </div>
              </div>

              <div className="composer-main" style={{ opacity: 0.8 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "16px" }}>
                  Message Preview
                </label>
                <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", fontSize: "16px", lineHeight: "1.6", color: "#334155" }}>
                  {message || "—"}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="messaging-hub">
            <div className="success-screen">
              <div className="success-icon-check">
                <CheckCircle2 size={64} />
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "12px" }}>Message Sent!</h1>
              <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "400px", margin: "0 auto 40px" }}>
                Your broadcast has been queued for delivery to <strong>{estimatedRecipients.toLocaleString()} contacts</strong>.
              </p>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button className="btn-premium" size="lg" onClick={() => setCurrentView('history')}>
                  View History
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { setCurrentView('dashboard'); setStep(1); }}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderHistory = () => (
    <div className="messaging-hub">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <Button variant="ghost" onClick={handleBack} style={{ paddingLeft: 0, marginBottom: "8px" }}>
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Back
          </Button>
          <h1>Message History</h1>
        </div>
        <Button className="btn-premium" onClick={handleStartFlow}>
          <Send size={18} style={{ marginRight: "8px" }} /> New Message
        </Button>
      </div>

      {historyQuery.isLoading ? (
        <Card style={{ padding: "32px", textAlign: "center" }}>Loading history…</Card>
      ) : historyQuery.isError ? (
        <Card style={{ padding: "32px", textAlign: "center" }}>
          <p>Could not load message history.</p>
          <Button size="sm" onClick={() => historyQuery.refetch()}>Retry</Button>
        </Card>
      ) : (historyQuery.data?.data ?? []).length === 0 ? (
        <Card style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)" }}>
          <History size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
          <p>No messages sent yet.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(historyQuery.data?.data ?? []).map((h) => (
            <Card key={h.id} style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{h.to_phone}</strong>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                  {new Date(h.at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {h.body_preview}
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "12px" }}>
                <span className={`status-pill ${h.status}`}>
                  Status: {h.status}
                </span>
                <span style={{ color: "var(--text-tertiary)" }}>
                  Template: {h.template}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="messaging-hub">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <Button variant="ghost" onClick={handleBack} style={{ paddingLeft: 0, marginBottom: "8px" }}>
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Back
          </Button>
          <h1>SMS Templates</h1>
        </div>
        <Button
          className="btn-premium"
          onClick={() => setIsCreateTemplateOpen(true)}
        >
          <Plus size={18} style={{ marginRight: "8px" }} /> Create Template
        </Button>
      </div>

      {templatesQuery.isLoading ? (
        <Card style={{ padding: "32px", textAlign: "center" }}>Loading templates…</Card>
      ) : templatesQuery.isError ? (
        <Card style={{ padding: "32px", textAlign: "center" }}>
          <p>Could not load templates.</p>
          <Button size="sm" onClick={() => templatesQuery.refetch()}>Retry</Button>
        </Card>
      ) : (templatesQuery.data ?? []).length === 0 ? (
        <Card style={{ padding: "32px", textAlign: "center" }}>
          <LayoutTemplate size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
          <p>No templates yet. Create your first one.</p>
          <Button
            className="btn-premium"
            onClick={() => setIsCreateTemplateOpen(true)}
            style={{ marginTop: "16px" }}
          >
            <Plus size={16} style={{ marginRight: "6px" }} /> Create Template
          </Button>
        </Card>
      ) : (
        <div className="recipient-cards-grid">
          {(templatesQuery.data ?? []).map((t) => (
            <div key={t.id} className="recipient-type-card">
              <div className="recipient-icon-bg"><LayoutTemplate size={32} /></div>
              <div className="recipient-info">
                <h3>{t.name}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{t.body}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setMessage(t.body);
                    setCurrentView('flow');
                    setStep(4);
                  }}
                >
                  Use
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDeleteTemplate(t.id, t.name)}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="hq-dashboard-premium" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'flow' && renderFlow()}
      {currentView === 'history' && renderHistory()}
      {currentView === 'templates' && renderTemplates()}

      <SuccessModal
        isOpen={showSendSuccess}
        onClose={() => setShowSendSuccess(false)}
        icon="send"
        title="Message Sent!"
        description={
          sendSuccessInfo
            ? `Delivered to ${sendSuccessInfo.sent} of ${sendSuccessInfo.total} contact${sendSuccessInfo.total === 1 ? "" : "s"}${sendSuccessInfo.failed > 0 ? `. ${sendSuccessInfo.failed} failed.` : "."}`
            : "Your broadcast has been queued for delivery."
        }
        primaryAction={{
          label: "Send Another",
          onClick: () => {
            setShowSendSuccess(false);
            setStep(1);
            setMessage("");
            setMessageTitle("");
            setRecipientType(null);
            setSelectedLocationId(null);
            setSelectedTeamId(null);
            setManualPhones("");
          },
        }}
        secondaryAction={{
          label: "Back to Hub",
          navigateTo: "/main/messages",
        }}
      />

      <Modal
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        title="Create SMS Template"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Template Name"
            placeholder="e.g. Service Reminder"
            value={newTemplateName}
            onChange={(e) => {
              setNewTemplateName(e.target.value);
              if (errors["newTemplateName"]) clearAll();
            }}
            error={errors["newTemplateName"]}
            disabled={createTemplate.isPending}
          />
          <div>
            <label className="input-label" style={{ display: "block", marginBottom: "6px" }}>
              Message Body
            </label>
            <textarea
              className="input-field textarea-field"
              placeholder="Type the template body. Use {name}, {organization}, {location}, {date} as placeholders."
              value={newTemplateBody}
              onChange={(e) => {
                setNewTemplateBody(e.target.value);
                if (errors["newTemplateBody"]) clearAll();
              }}
              rows={5}
              disabled={createTemplate.isPending}
            />
            {errors["newTemplateBody"] && (
              <p className="input-error-text" style={{ marginTop: "6px" }}>
                {errors["newTemplateBody"]}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button
              variant="outline"
              onClick={() => setIsCreateTemplateOpen(false)}
              disabled={createTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              className="btn-premium"
              onClick={handleCreateTemplate}
              disabled={createTemplate.isPending}
            >
              {createTemplate.isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function OrganizationMessagingPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Messaging Center...</div>}>
      <MessagingContent />
    </Suspense>
  );
}
