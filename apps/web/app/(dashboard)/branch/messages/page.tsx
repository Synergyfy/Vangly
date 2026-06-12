"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  Plus,
  Smile,
  Zap,
  Clock,
  ChevronDown,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useAuth } from "@/services/auth";
import {
  useLocationMembers,
  useLocationTeams,
} from "@/services/manage-organization";
import {
  useMessageTemplates,
  useCreateMessageTemplate,
  useSendMessage,
} from "@/services/messages";
import { useWalletBalance } from "@/services/wallet";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { isValidMessageBody, isValidTemplateName } from "@/lib/forms/validators";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "./branch-messages.css";

const EMOJIS = [
  "\u{1F60A}", "\u{1F602}", "\u{1F970}", "\u{1F64C}", "\u{1F64F}", "\u2728",
  "\u{1F525}", "\u2764\uFE0F", "\u{1F44D}", "\u{1F44B}", "\u{1F389}", "\u{1F4E2}",
  "\u26EA}", "\u{1F3E0}", "\u{1F4CD}",
];

export default function BranchMessagingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;

  const balanceQuery = useWalletBalance();
  const membersQuery = useLocationMembers(branchId, { page: 1, per_page: 500 });
  const teamsQuery = useLocationTeams(branchId, { page: 1, per_page: 100 });
  const templatesQuery = useMessageTemplates();
  const sendMessage = useSendMessage();
  const createTemplate = useCreateMessageTemplate();

  const [recipientTab, setRecipientTab] = useState<"all" | "teams">("all");
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSending = sendMessage.isPending;
  const creditBalance = balanceQuery.data?.balance ?? 0;
  const members = membersQuery.data?.data ?? [];
  const teams = teamsQuery.data?.data ?? [];

  const characterCount = message.length;
  const smsUnits = Math.max(1, Math.ceil(characterCount / 160));
  const recipientCount = recipientTab === "all" ? members.length : members.length;
  const estimatedCost = (smsUnits * recipientCount * 4).toLocaleString();

  const isHighRisk =
    message.toLowerCase().includes("immediate action") ||
    message.toLowerCase().includes("urgent") ||
    message.toLowerCase().includes("click here");

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplate(tplId);
    if (tplId === "none") {
      setMessage("");
      return;
    }
    const tpl = (templatesQuery.data ?? []).find((t) => t.id === tplId);
    if (tpl) setMessage(tpl.body);
  };

  const handleSend = async () => {
    clearAll();

    if (!branchId) {
      toast.error("No branch is associated with your account.");
      return;
    }
    if (!isValidMessageBody(message)) {
      setError("message", "Enter a message up to 1600 characters.");
      return;
    }
    if (members.length === 0) {
      setError("recipients", "No members to send to.");
      return;
    }
    if (creditBalance < recipientCount * smsUnits) {
      toast.error("You don't have enough SMS credits.", {
        action: {
          label: "Top up",
          onClick: () => router.push("/branch/wallet"),
        },
      });
      return;
    }

    const phoneList = members.map((m) => ({
      phone: m.phone,
      name: m.name,
    }));

    try {
      const result = await sendMessage.mutateAsync({
        recipients: phoneList,
        body: message,
      });
      setSuccessResult({
        sent: result.sent,
        failed: result.failed,
        total: result.total,
      });
      setMessage("");
      setSelectedTemplate("none");
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not send your broadcast."));
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
      const tpl = await createTemplate.mutateAsync({
        name: newTemplateName.trim(),
        body: newTemplateBody,
        scope: "location",
        location_id: branchId,
        channel: "sms",
        mode: "flexible",
      });
      setNewTemplateName("");
      setNewTemplateBody("");
      setIsTemplateModalOpen(false);
      setSelectedTemplate(tpl.id);
      toast.success(`Template "${tpl.name}" created.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save your template."));
    }
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Broadcast Hub</div>
          <h1>Messaging Center</h1>
          <p>Engage your entire location or target specific outreach teams.</p>
        </div>
        <div className="header-actions">
          <Card className="credit-pill-premium">
            <Zap size={16} />
            <span>
              {balanceQuery.isLoading
                ? "—"
                : `${creditBalance.toLocaleString()} SMS Units`}
            </span>
          </Card>
        </div>
      </header>

      <div className="messaging-v2-container">
        <div className="messaging-v2-main">
          <section className="messaging-section-card">
            <span className="section-label">Recipient Selection</span>
            <div className="recipient-tabs">
              <div
                className={`recipient-tab ${recipientTab === "all" ? "active" : ""}`}
                onClick={() => setRecipientTab("all")}
              >
                Entire Location
              </div>
              <div
                className={`recipient-tab ${recipientTab === "teams" ? "active" : ""}`}
                onClick={() => {
                  setRecipientTab("teams");
                  setIsTeamModalOpen(true);
                }}
              >
                Specific Teams
              </div>
            </div>

            {recipientTab === "all" ? (
              <div className="selected-groups-display">
                <span className="selected-count">
                  {membersQuery.isLoading
                    ? "Loading members..."
                    : `Broadcasting to All ${members.length} Members`}
                </span>
                <div className="selected-tags">
                  <span className="selected-tag">This Location</span>
                  <span className="selected-tag">All Outreach Teams</span>
                </div>
              </div>
            ) : selectedTeams.length > 0 ? (
              <div className="selected-groups-display">
                <span className="selected-count">
                  {selectedTeams.length} Team
                  {selectedTeams.length === 1 ? "" : "s"} Selected
                </span>
                <div className="selected-tags">
                  {selectedTeams.slice(0, 3).map((id) => {
                    const team = teams.find((t) => t.id === id);
                    return (
                      <span key={id} className="selected-tag">
                        {team?.name ?? "Unknown"}
                      </span>
                    );
                  })}
                  {selectedTeams.length > 3 && (
                    <span className="selected-tag more">
                      +{selectedTeams.length - 3} more
                    </span>
                  )}
                  <button
                    className="btn-edit-selection"
                    onClick={() => setIsTeamModalOpen(true)}
                  >
                    Change Selection
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    marginTop: "8px",
                  }}
                >
                  Sending to all {members.length} members of this location.
                </p>
              </div>
            ) : (
              <div className="selected-groups-display">
                <span className="selected-count">No teams selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTeamModalOpen(true)}
                >
                  Choose teams
                </Button>
              </div>
            )}
            {errors["recipients"] && (
              <p className="input-error-text" style={{ marginTop: "8px" }}>
                {errors["recipients"]}
              </p>
            )}
          </section>

          <section className="messaging-section-card">
            <div className="composer-header">
              <span className="section-label" style={{ marginBottom: 0 }}>
                SMS Composer
              </span>
              <div
                className="template-dropdown-v2"
                style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
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
                  <option value="none">Quick Templates</option>
                  {(templatesQuery.data ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <span>
                  {selectedTemplate === "none"
                    ? "Use Template"
                    : (templatesQuery.data ?? []).find(
                        (t) => t.id === selectedTemplate,
                      )?.name ?? "Use Template"}
                </span>
                <ChevronDown size={16} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTemplateModalOpen(true)}
                  style={{ marginLeft: "4px" }}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div className="textarea-wrapper-v2">
              <textarea
                className="composer-textarea-v2"
                placeholder="Type your broadcast message here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors["message"]) clearAll();
                }}
                disabled={isSending}
              />
              <div className="composer-toolbar">
                <div style={{ position: "relative" }}>
                  <Smile
                    className="toolbar-icon"
                    size={20}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  />
                  {showEmojiPicker && (
                    <div className="emoji-picker-simple fade-in">
                      {EMOJIS.map((emoji) => (
                        <span
                          key={emoji}
                          onClick={() => {
                            setMessage((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {errors["message"] && (
              <p className="input-error-text" style={{ marginTop: "8px" }}>
                {errors["message"]}
              </p>
            )}

            <div className="stats-grid-v2">
              <div className="stat-box-v2">
                <span className="stat-label-v2">Characters</span>
                <span className="stat-value-v2">{characterCount} / 160</span>
              </div>
              <div className="stat-box-v2">
                <span className="stat-label-v2">Units</span>
                <span className="stat-value-v2">{smsUnits} SMS</span>
              </div>
              <div className="stat-box-v2">
                <span className="stat-label-v2">Estimated Impact</span>
                <span className="stat-value-v2">High</span>
              </div>
            </div>

            {isHighRisk && (
              <div className="high-risk-alert-premium fade-in">
                <AlertCircle size={24} />
                <div className="risk-content">
                  <strong>Delivery Optimization Required</strong>
                  <p>
                    Your message contains keywords that may be flagged by
                    carrier filters. Consider rephrasing for better
                    deliverability.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="messaging-v2-sidebar">
          <div className="phone-preview-v2">
            <div className="phone-screen-v2">
              <div className="phone-header-v2">
                <div className="phone-avatar-v2">
                  <Building2 size={16} />
                </div>
                <span className="phone-number-v2">Location</span>
              </div>
              <div className="phone-chat-v2">
                <div className="chat-bubble-v2">
                  {message || "Message preview will appear here..."}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="messaging-footer-v2">
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-label">Recipients</span>
              <span className="footer-stat-value">
                {recipientCount.toLocaleString()}
              </span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-label">Estimated Cost</span>
              <span className="footer-stat-value">₦{estimatedCost}</span>
            </div>
          </div>
          <div className="footer-actions">
            <Button variant="outline" size="lg" className="btn-schedule-v2" disabled>
              <Clock size={20} /> Schedule
            </Button>
            <Button
              size="lg"
              className="btn-send-v2"
              onClick={handleSend}
              disabled={isSending}
            >
              <Send size={20} />
              {isSending ? "Sending..." : "Send Broadcast"}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Select Outreach Teams"
      >
        <div className="selection-table-container">
          {teamsQuery.isLoading ? (
            <p style={{ padding: "24px", textAlign: "center" }}>Loading teams...</p>
          ) : teamsQuery.isError ? (
            <div style={{ padding: "24px" }}>
              <p>Could not load teams.</p>
              <Button size="sm" onClick={() => teamsQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : teams.length === 0 ? (
            <p style={{ padding: "24px", textAlign: "center" }}>
              No teams yet. Create teams in Teams settings.
            </p>
          ) : (
            <table className="selection-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>Outreach Team</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const checked = selectedTeams.includes(team.id);
                  return (
                    <tr
                      key={team.id}
                      className={checked ? "selected" : ""}
                      onClick={() => {
                        setSelectedTeams((prev) =>
                          prev.includes(team.id)
                            ? prev.filter((id) => id !== team.id)
                            : [...prev, team.id],
                        );
                      }}
                    >
                      <td>
                        <input type="checkbox" checked={checked} readOnly />
                      </td>
                      <td>
                        <div className="group-cell">
                          <div className="group-avatar">
                            {team.name.slice(0, 2).toUpperCase()}
                          </div>
                          {team.name}
                        </div>
                      </td>
                      <td>{team.member_count} Active Members</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-footer-v2">
          <div className="footer-left">
            <div className="count-pill">{selectedTeams.length} teams selected</div>
          </div>
          <div className="footer-actions">
            <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="btn-premium"
              onClick={() => {
                setRecipientTab("teams");
                setIsTeamModalOpen(false);
              }}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
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
            <label
              className="input-label"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Message Body
            </label>
            <textarea
              className="input-field textarea-field"
              placeholder="Type the template body. You can use {name}, {organization}, {location}, {date} as placeholders."
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
              onClick={() => setIsTemplateModalOpen(false)}
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

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="send"
        title="Broadcast Sent!"
        description={
          successResult
            ? `Delivered to ${successResult.sent} of ${successResult.total} member${
                successResult.total === 1 ? "" : "s"
              }${successResult.failed > 0 ? `. ${successResult.failed} failed.` : "."}`
            : "Your broadcast has been queued for delivery."
        }
        primaryAction={{
          label: "Send Another",
          onClick: () => setShowSuccess(false),
        }}
        secondaryAction={{
          label: "View Wallet",
          navigateTo: "/branch/wallet",
        }}
      />
    </div>
  );
}
