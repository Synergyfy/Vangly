"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  User,
  Search,
  Smile,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useAuth } from "@/services/auth";
import { useContactsList } from "@/services/contacts";
import { useMessageTemplates, useSendMessage } from "@/services/messages";
import { useWalletBalance } from "@/services/wallet";
import { useFieldErrors } from "@/lib/forms/use-field-errors";
import { isValidMessageBody } from "@/lib/forms/validators";
import { extractErrorMessage } from "@/lib/forms/extract-error-message";
import "./worker-messages.css";

const EMOJIS = [
  "\u{1F60A}", "\u{1F602}", "\u{1F970}", "\u{1F64C}", "\u{1F64F}", "\u2728",
  "\u{1F525}", "\u2764\uFE0F", "\u{1F44D}", "\u{1F44B}", "\u{1F389}", "\u{1F4E2}",
  "\u26EA}", "\u{1F3E0}", "\u{1F4CD}",
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export default function WorkerMessagingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const balanceQuery = useWalletBalance();
  const contactsQuery = useContactsList({ page: 1, page_size: 200 });
  const templatesQuery = useMessageTemplates();
  const sendMessage = useSendMessage();

  const [recipientTab, setRecipientTab] = useState<"all" | "manual">("all");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSending = sendMessage.isPending;
  const creditBalance = balanceQuery.data?.balance ?? user?.credits ?? 0;

  const contacts = useMemo(
    () => contactsQuery.data ?? [],
    [contactsQuery.data],
  );
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
    );
  }, [contacts, searchQuery]);

  const characterCount = message.length;
  const smsUnits = Math.max(1, Math.ceil(characterCount / 160));
  const costPerSms = 4.0;
  const recipientCount = recipientTab === "all" ? contacts.length : selectedContacts.length;
  const totalCost = recipientCount * smsUnits * costPerSms;

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

    if (!isValidMessageBody(message)) {
      setError("message", "Enter a message up to 1600 characters.");
      return;
    }
    if (recipientCount === 0) {
      setError("recipients", "Pick at least one contact to send to.");
      return;
    }
    if (creditBalance < recipientCount * smsUnits) {
      toast.error("You don't have enough SMS credits.", {
        action: {
          label: "Top up",
          onClick: () => router.push("/worker/top-up"),
        },
      });
      return;
    }

    const phoneList = (
      recipientTab === "all" ? contacts : contacts.filter((c) => selectedContacts.includes(c.id))
    ).map((c) => ({ phone: c.phone, contact_id: c.id, name: c.name }));

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
      setSelectedContacts([]);
      setSelectedTemplate("none");
      setRecipientTab("all");
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not send your outreach."));
    }
  };

  return (
    <div className="worker-messaging-page">
      <div className="dashboard-header">
        <div
          className="header-badge"
          style={{
            background: "var(--blue-subtle)",
            color: "var(--blue)",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.7rem",
            fontWeight: 700,
            display: "inline-block",
            marginBottom: "0.5rem",
          }}
        >
          OUTREACH HUB
        </div>
        <h1>Worker Messaging</h1>
        <p>Personalized outreach to your assigned contacts.</p>
      </div>

      <div className="messaging-v2-container">
        <div className="messaging-v2-main">
          <div className="messaging-section-card">
            <span className="section-label">Recipient Selection</span>
            <div
              className="recipient-selection-header"
              style={{ marginBottom: "16px" }}
            >
              <div className="recipient-tabs">
                <div
                  className={`recipient-tab ${recipientTab === "all" ? "active" : ""}`}
                  onClick={() => setRecipientTab("all")}
                >
                  All My Contacts
                </div>
                <div
                  className={`recipient-tab ${recipientTab === "manual" ? "active" : ""}`}
                  onClick={() => {
                    setRecipientTab("manual");
                    setIsContactModalOpen(true);
                  }}
                >
                  Select Individual
                </div>
              </div>
            </div>

            {recipientTab === "all" ? (
              <div className="selected-groups-display">
                <span className="selected-count">
                  {contactsQuery.isLoading
                    ? "Loading contacts..."
                    : `${contacts.length} Assigned Members Selected`}
                </span>
                <div className="selected-tags">
                  <span className="selected-tag">Recent Contacts Included</span>
                </div>
              </div>
            ) : selectedContacts.length > 0 ? (
              <div className="selected-groups-display">
                <span className="selected-count">
                  {selectedContacts.length} Contacts Selected
                </span>
                <div className="selected-tags">
                  {selectedContacts.slice(0, 3).map((id) => {
                    const contact = contacts.find((c) => c.id === id);
                    return (
                      <span key={id} className="selected-tag">
                        {contact?.name ?? "Unknown"}
                      </span>
                    );
                  })}
                  {selectedContacts.length > 3 && (
                    <span className="selected-tag more">
                      +{selectedContacts.length - 3} more
                    </span>
                  )}
                  <button
                    className="btn-edit-selection"
                    onClick={() => setIsContactModalOpen(true)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="selected-groups-display">
                <span className="selected-count">No contacts selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  Choose contacts
                </Button>
              </div>
            )}
            {errors["recipients"] && (
              <p className="input-error-text" style={{ marginTop: "8px" }}>
                {errors["recipients"]}
              </p>
            )}
          </div>

          <div className="messaging-section-card">
            <div className="composer-header">
              <span className="section-label" style={{ marginBottom: 0 }}>
                SMS Composer
              </span>
              <div
                className="template-dropdown-v2"
                style={{ position: "relative" }}
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
                  <option value="none">No Template (Custom)</option>
                  {(templatesQuery.data ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <span>
                  {selectedTemplate === "none"
                    ? "Template Selection"
                    : (templatesQuery.data ?? []).find(
                        (t) => t.id === selectedTemplate,
                      )?.name ?? "Template Selection"}
                </span>
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="textarea-wrapper-v2">
              <textarea
                className="composer-textarea-v2"
                placeholder="Type your outreach message here..."
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
                    <div className="emoji-picker-simple">
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
                <span className="stat-value-v2">
                  {characterCount}{" "}
                  <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
                    / 160
                  </span>
                </span>
              </div>
              <div className="stat-box-v2">
                <span className="stat-label-v2">Units</span>
                <span className="stat-value-v2">{smsUnits} SMS</span>
              </div>
              <div className="stat-box-v2">
                <span className="stat-label-v2">Credits</span>
                <span className="stat-value-v2">
                  ₦{(smsUnits * costPerSms).toFixed(2)}
                </span>
              </div>
            </div>

            {isHighRisk && (
              <div className="high-risk-alert">
                <AlertCircle className="risk-icon" size={24} />
                <div className="risk-content">
                  <strong>High Risk Content</strong>
                  <p>
                    Your message may be flagged by carriers. Avoid urgent
                    phrases or suspicious links.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="messaging-v2-sidebar">
          <div className="phone-preview-v2">
            <div className="phone-screen-v2">
              <div className="phone-header-v2">
                <div className="phone-avatar-v2">
                  <User size={16} />
                </div>
                <span className="phone-number-v2"> Outreach</span>
              </div>
              <div className="phone-chat-v2">
                <div className="chat-bubble-v2">
                  {message || "Start typing to see your outreach preview..."}
                </div>
                <span className="chat-time-v2">Now · SMS</span>
              </div>
            </div>
          </div>

          <Card
            style={{ padding: "1.5rem", background: "white", marginTop: "24px" }}
          >
            <span className="section-label">Messaging Tips</span>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginTop: "12px",
              }}
            >
              <Sparkles
                size={16}
                style={{ color: "var(--blue)", marginTop: "2px" }}
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Personalize your messages using names for better engagement
                rates.
              </p>
            </div>
          </Card>
        </div>

        <div className="messaging-footer-v2">
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-label">Recipients</span>
              <span className="footer-stat-value">
                {recipientTab === "all" ? contacts.length : selectedContacts.length}
              </span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-label">Total Credits</span>
              <span className="footer-stat-value">₦{totalCost.toFixed(2)}</span>
            </div>
          </div>
          <div className="footer-actions">
            <Button
              className="btn-send-v2"
              onClick={handleSend}
              disabled={isSending}
            >
              <Send size={20} />
              {isSending ? "Sending..." : "Send Outreach"}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Select Contacts"
      >
        <div className="search-bar-v2" style={{ flex: 1, marginBottom: "16px" }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search your contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        {contactsQuery.isLoading ? (
          <p style={{ padding: "24px", textAlign: "center" }}>Loading contacts...</p>
        ) : contactsQuery.isError ? (
          <div style={{ padding: "24px" }}>
            <p>Could not load contacts.</p>
            <Button size="sm" onClick={() => contactsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <p style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)" }}>
            {searchQuery ? "No contacts match your search." : "No contacts yet."}
          </p>
        ) : (
          <div className="selection-table-container">
            <table className="selection-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>Contact Name</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => {
                  const checked = selectedContacts.includes(contact.id);
                  return (
                    <tr
                      key={contact.id}
                      className={checked ? "selected" : ""}
                      onClick={() => {
                        setSelectedContacts((prev) =>
                          prev.includes(contact.id)
                            ? prev.filter((id) => id !== contact.id)
                            : [...prev, contact.id],
                        );
                      }}
                    >
                      <td>
                        <input type="checkbox" checked={checked} readOnly />
                      </td>
                      <td>
                        <div className="group-cell">
                          <div
                            className="group-avatar"
                            style={{ borderRadius: "50%" }}
                          >
                            {initialsFor(contact.name)}
                          </div>
                          {contact.name}
                        </div>
                      </td>
                      <td>{contact.phone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-footer-v2">
          <div className="footer-left">
            <div className="count-pill">{selectedContacts.length} selected</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedContacts([])}
            >
              Clear Selection
            </Button>
          </div>
          <div className="footer-actions">
            <Button
              variant="outline"
              onClick={() => setIsContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-premium"
              onClick={() => {
                setRecipientTab("manual");
                setIsContactModalOpen(false);
              }}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="send"
        title="Outreach Sent!"
        description={
          successResult
            ? `Delivered to ${successResult.sent} of ${successResult.total} contact${
                successResult.total === 1 ? "" : "s"
              }${successResult.failed > 0 ? `. ${successResult.failed} failed.` : "."}`
            : "Your outreach has been queued for delivery."
        }
        primaryAction={{
          label: "Back to Dashboard",
          navigateTo: "/worker",
        }}
        secondaryAction={{
          label: "Send Another",
          onClick: () => setShowSuccess(false),
        }}
      />
    </div>
  );
}
