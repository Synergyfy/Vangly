"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Send,
  Users,
  MessageSquare,
  Mail,
  Type,
  Layout,
  History,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Plus,
  Shield,
  Edit3,
  Trash2,
  Smile,
  AtSign,
  Zap,
  Clock,
  Info,
  Calendar,
  Smartphone,
  ChevronDown,
  User,
} from "lucide-react";
import "../hq.css";

export default function HQMessagingPage() {
  const [activeTab, setActiveTab] = useState<
    "compose" | "history" | "templates"
  >("compose");
  const [target, setTarget] = useState("all");
  const [messageType, setMessageType] = useState<"sms" | "email">("sms");
  const [selectedTemplate, setSelectedTemplate] = useState("none");
  const [messagingMode, setMessagingMode] = useState<
    "strict" | "flexible" | "open"
  >("flexible");

  // New UI State
  const [recipientTab, setRecipientTab] = useState<
    "all" | "groups" | "selected" | "manual"
  >("all");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ["😊", "😂", "🥰", "🙌", "🙏", "✨", "🔥", "❤️", "👍", "👋", "🎉", "📢", "⛪", "🏠", "📍"];

  // Derived stats (mock values for now, would be calculated in real app)
  const characterCount = message.length;
  const smsUnits = Math.ceil(characterCount / 160) || 1;
  const costPerSms = 4.0; // Naira cost
  const estimatedCost = (smsUnits * 1248 * costPerSms).toLocaleString(); // Assuming 1248 recipients
  const isHighRisk =
    message.toLowerCase().includes("immediate action") ||
    message.toLowerCase().includes("urgent") ||
    message.toLowerCase().includes("click here");

  const [templates, setTemplates] = useState([
    {
      id: "t1",
      name: "First Contact",
      subject: "Welcome to [Church Name]",
      content:
        "Hi [Name], we are so glad you joined us today at [Church Name]! We hope you had a great time.",
    },
    {
      id: "t2",
      name: "Follow-up",
      subject: "We missed you!",
      content:
        "Hello [Name], we missed you at service today. Hope everything is well. [Worker Name] from [Church Name].",
    },
    {
      id: "t3",
      name: "Service Reminder",
      subject: "See you tomorrow",
      content:
        "Hey [Name]! Just a reminder that service starts at 9AM tomorrow. See you there!",
    },
  ]);

  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    content: "",
  });

  const handleEditTemplate = (template: any) => {
    setCurrentTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
    });
    setIsEditingTemplate(true);
  };

  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setTemplateForm({ name: "", subject: "", content: "" });
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = () => {
    if (currentTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === currentTemplate.id ? { ...t, ...templateForm } : t,
        ),
      );
    } else {
      const newId = `t${templates.length + 1}`;
      setTemplates([...templates, { id: newId, ...templateForm }]);
    }
    setIsEditingTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const sentMessages = [
    {
      id: "m1",
      to: "All Workers",
      date: "Oct 12, 10:30 AM",
      type: "SMS",
      status: "delivered",
    },
    {
      id: "m2",
      to: "Northside Branch",
      date: "Oct 10, 02:15 PM",
      type: "Email",
      status: "sent",
    },
  ];

  return (
    <div className="hq-dashboard">
      {/* Template Edit Modal */}
      {isEditingTemplate && (
        <div className="modal-overlay">
          <Card className="modal-card-premium template-modal">
            <div className="modal-header">
              <h2>
                {currentTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTemplate(false)}
              >
                <Plus size={24} style={{ transform: "rotate(45deg)" }} />
              </Button>
            </div>
            <div className="form-stack">
              <Input
                label="Template Name"
                placeholder="e.g. First Timer Welcome"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
              />
              <Input
                label="Email Subject (Optional)"
                placeholder="Welcome to our church!"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, subject: e.target.value })
                }
              />
              <div className="form-group-premium">
                <label>Message Content</label>
                <textarea
                  className="message-textarea"
                  rows={6}
                  value={templateForm.content}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Use [Name], [Church Name], etc."
                />
              </div>
              <div className="modal-actions">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingTemplate(false)}
                >
                  Cancel
                </Button>
                <Button className="btn-premium" onClick={handleSaveTemplate}>
                  {currentTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Communication Hub</div>
          <h1>Messaging Center</h1>
          <p>
            Send broadcast updates and automated follow-ups across your network.
          </p>
        </div>
        <div className="credit-pill">
          <span className="credit-label">Available Credits:</span>
          <span className="credit-count">12,450</span>
        </div>
      </div>

      <div className="messaging-tabs-wrapper">
        <button
          className="tab-scroll-btn left"
          onClick={() => {
            const el = document.getElementById("messaging-tabs-scroll");
            if (el) el.scrollBy({ left: -150, behavior: "smooth" });
          }}
        >
          <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
        </button>

        <div className="messaging-tabs" id="messaging-tabs-scroll">
          <button
            className={activeTab === "compose" ? "active" : ""}
            onClick={() => setActiveTab("compose")}
          >
            <Send size={18} /> Compose
          </button>
          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            <History size={18} /> Sent History
          </button>
          <button
            className={activeTab === "templates" ? "active" : ""}
            onClick={() => setActiveTab("templates")}
          >
            <Layout size={18} /> Template Management
          </button>
        </div>

        <button
          className="tab-scroll-btn right"
          onClick={() => {
            const el = document.getElementById("messaging-tabs-scroll");
            if (el) el.scrollBy({ left: 150, behavior: "smooth" });
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="messaging-content-layout">
        {activeTab === "compose" && (
          <div className="messaging-v2-container">
            <div className="messaging-v2-main">
              {/* Recipient Selection */}
              <div className="messaging-section-card">
                <span className="section-label">Recipient Selection</span>
                <div className="form-group-premium" style={{ marginTop: '12px' }}>
                  <div className="audience-selector">
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      style={{
                        width: '100%',
                        height: '52px',
                        padding: '0 16px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '12px',
                        fontSize: '15px',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center'
                      }}
                    >
                      <option value="all">Everyone (All Branches & Workers)</option>
                      <option value="admins">Branch Admins Only</option>
                      <option value="workers">All Workers Only</option>
                      <option value="hq">HQ Branch Only</option>
                    </select>
                  </div>
                </div>
                <div className="search-bar-v2" style={{ marginTop: '16px' }}>
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Search within selected audience..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* SMS Composer */}
              <div className="messaging-section-card">
                <div className="composer-header">
                  <span className="section-label" style={{ marginBottom: 0 }}>
                    SMS Composer
                  </span>
                  <div className="template-dropdown-v2" style={{ position: 'relative' }}>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => {
                        const tId = e.target.value;
                        setSelectedTemplate(tId);
                        if (tId !== "none") {
                          const t = templates.find(temp => temp.id === tId);
                          if (t) setMessage(t.content);
                        } else {
                          setMessage("");
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="none">No Template (Custom)</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <span>
                      {selectedTemplate === "none" 
                        ? "Template Selection" 
                        : templates.find(t => t.id === selectedTemplate)?.name}
                    </span>
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="textarea-wrapper-v2">
                  <textarea
                    className="composer-textarea-v2"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="composer-toolbar">
                    <div style={{ position: 'relative' }}>
                      <Smile 
                        className="toolbar-icon" 
                        size={20} 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      />
                      {showEmojiPicker && (
                        <div className="emoji-picker-simple">
                          {emojis.map(emoji => (
                            <span 
                              key={emoji} 
                              onClick={() => {
                                setMessage(prev => prev + emoji);
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

                <div className="stats-grid-v2">
                  <div className="stat-box-v2">
                    <span className="stat-label-v2">Characters</span>
                    <span className="stat-value-v2">
                      {characterCount} <span>/ 160</span>
                    </span>
                  </div>
                  <div className="stat-box-v2">
                    <span className="stat-label-v2">Units</span>
                    <span className="stat-value-v2">{smsUnits} SMS</span>
                  </div>
                  <div className="stat-box-v2">
                    <span className="stat-label-v2">Credits</span>
                    <span className="stat-value-v2">₦{(smsUnits * costPerSms).toFixed(2)}</span>
                  </div>
                </div>

                {isHighRisk && (
                  <div className="high-risk-alert">
                    <AlertCircle className="risk-icon" size={24} />
                    <div className="risk-content">
                      <strong>High Risk Words Detected</strong>
                      <p>
                        Your message contains suspicious links and urgent
                        phrases like "Immediate action". This may trigger
                        carrier spam filters or be flagged as phishing.
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
                    <span className="phone-number-v2">123456</span>
                  </div>
                  <div className="phone-chat-v2">
                    <div className="chat-bubble-v2">
                      {message ||
                        "Hey! Your account was just accessed from a new device in Vegas. If this wasn't you, please click here: http://secure-login-384.com/verify. Immediate action required!"}
                    </div>
                    <span className="chat-time-v2">Now · SMS</span>
                  </div>
                </div>
              </div>

              <div className="delivery-estimate-card">
                <span className="section-label">Estimated Delivery</span>
                <div className="estimate-row">
                  <div className="estimate-label">
                    <Zap size={18} className="text-primary" />
                    Avg. Speed
                  </div>
                  <div className="estimate-value">2.4 seconds</div>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: "85%" }}
                  />
                </div>
                <div className="success-rate-row">
                  <span className="estimate-label">Success Rate</span>
                  <span className="estimate-value">98.2%</span>
                </div>
                <div className="high-traffic-notice">
                  <Info size={18} className="text-primary" />
                  High traffic expected in the UK region.
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="messaging-footer-v2">
              <div className="footer-stats">
                <div className="footer-stat">
                  <span className="footer-stat-label">Total Recipients</span>
                  <span className="footer-stat-value">1,248</span>
                </div>
                <div className="footer-stat">
                  <span className="footer-stat-label">Total Cost</span>
                  <span className="footer-stat-value">₦{estimatedCost}</span>
                </div>
              </div>
              <div className="footer-actions">
                <button className="btn-schedule-v2">
                  <Clock size={20} />
                  Schedule
                </button>
                <button className="btn-send-v2">
                  <Send size={20} />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <Card className="user-table-card-premium">
            <div className="table-responsive">
              <table className="user-data-table">
                <thead>
                  <tr>
                    <th>Recipients</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sentMessages.map((msg) => (
                    <tr key={msg.id} className="user-row">
                      <td>
                        <strong>{msg.to}</strong>
                      </td>
                      <td>{msg.date}</td>
                      <td>
                        <span className="role-pill worker">{msg.type}</span>
                      </td>
                      <td>
                        <span className="status-indicator active">
                          {msg.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <Button variant="ghost" size="sm">
                          View Log
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "templates" && (
          <div className="templates-management-grid">
            <div className="templates-list-side">
              <div
                className="section-header-flex"
                style={{ marginBottom: "20px" }}
              >
                <h3>Active Templates</h3>
                <Button size="sm" variant="outline" onClick={handleNewTemplate}>
                  <Plus size={16} /> New
                </Button>
              </div>
              <div className="template-cards-stack">
                {templates.map((t) => (
                  <Card key={t.id} className="template-mini-card">
                    <div className="template-info">
                      <strong>{t.name}</strong>
                      <p>{t.content.substring(0, 60)}...</p>
                    </div>
                    <div className="template-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(t)}
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onClick={() => handleDeleteTemplate(t.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="template-settings-side">
              <Card className="messaging-mode-card">
                <h3>
                  <Shield size={18} /> Messaging Restrictions
                </h3>
                <p className="hint-text">
                  Control how workers can use these templates when following up
                  with their contacts.
                </p>

                <div className="mode-options-stack">
                  <div
                    className={`mode-option ${messagingMode === "strict" ? "active" : ""}`}
                    onClick={() => setMessagingMode("strict")}
                  >
                    <div className="mode-radio" />
                    <div className="mode-text">
                      <strong>Strict Mode</strong>
                      <span>
                        Workers can ONLY send these exact templates. No editing
                        allowed.
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mode-option ${messagingMode === "flexible" ? "active" : ""}`}
                    onClick={() => setMessagingMode("flexible")}
                  >
                    <div className="mode-radio" />
                    <div className="mode-text">
                      <strong>Flexible Mode (Recommended)</strong>
                      <span>
                        Workers can use templates and make minor edits before
                        sending.
                      </span>
                    </div>
                    <div className="recommendation-badge">Recommended</div>
                  </div>

                  <div
                    className={`mode-option ${messagingMode === "open" ? "active" : ""}`}
                    onClick={() => setMessagingMode("open")}
                  >
                    <div className="mode-radio" />
                    <div className="mode-text">
                      <strong>Open Mode</strong>
                      <span>
                        Workers can write completely custom messages from
                        scratch.
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  className="btn-premium"
                  style={{ marginTop: "24px" }}
                >
                  Save System Settings
                </Button>
              </Card>

              <Card
                className="placeholder-guide-card"
                style={{ marginTop: "24px" }}
              >
                <h3>How to use Placeholders</h3>
                <p>
                  Templates support dynamic data. Use these tags in your
                  content:
                </p>
                <ul className="placeholder-list">
                  <li>
                    <code>[Name]</code> - The Guest's Name
                  </li>
                  <li>
                    <code>[Church Name]</code> - Your Church's Name
                  </li>
                  <li>
                    <code>[Worker Name]</code> - The Worker's Name
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
