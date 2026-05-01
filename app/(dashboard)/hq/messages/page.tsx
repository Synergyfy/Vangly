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
          <div className="compose-grid">
            <Card className="compose-main-card">
              <div className="compose-form">
                <div className="form-group-premium">
                  <label>Select Audience</label>
                  <div className="audience-selector">
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    >
                      <option value="all">
                        Everyone (All Branches & Workers)
                      </option>
                      <option value="admins">Branch Admins Only</option>
                      <option value="workers">All Workers Only</option>
                      <option value="hq">HQ Branch Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-premium">
                  <label>Channel</label>
                  <div className="channel-toggle">
                    <button
                      className={messageType === "sms" ? "active" : ""}
                      onClick={() => setMessageType("sms")}
                    >
                      <MessageSquare size={16} /> SMS
                    </button>
                    <button
                      className={messageType === "email" ? "active" : ""}
                      onClick={() => setMessageType("email")}
                    >
                      <Mail size={16} /> Email
                    </button>
                  </div>
                </div>

                <div className="form-group-premium">
                  <label>Message Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    <option value="none">No Template (Custom Message)</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-premium">
                  <label>Message Content</label>
                  <textarea
                    placeholder="Type your message here... Use [Name], [Church Name] as placeholders."
                    className="message-textarea"
                    rows={8}
                    defaultValue={
                      selectedTemplate !== "none"
                        ? templates.find((t) => t.id === selectedTemplate)
                            ?.content
                        : ""
                    }
                  />
                  <div className="textarea-footer">
                    <span>160 characters per SMS</span>
                    <span>0/160</span>
                  </div>
                </div>

                <div className="compose-actions">
                  <Button className="btn-premium" fullWidth>
                    <Send size={18} /> Send Message Now
                  </Button>
                </div>
              </div>
            </Card>

            <div className="compose-side-panels">
              <Card className="summary-card-premium">
                <h3>Message Summary</h3>
                <div className="summary-list">
                  <div className="summary-row">
                    <span>Recipients</span>
                    <strong>452 people</strong>
                  </div>
                  <div className="summary-row">
                    <span>Est. Cost</span>
                    <strong className="text-primary">452 Credits</strong>
                  </div>
                  <div className="summary-row">
                    <span>Status</span>
                    <span className="status-indicator active">Ready</span>
                  </div>
                </div>
              </Card>

              <Card className="placeholder-tips-card">
                <h3>
                  <Type size={16} /> Placeholders
                </h3>
                <p>Personalize your message by adding these tags:</p>
                <div className="tag-list">
                  <code>[Name]</code>
                  <code>[Church Name]</code>
                  <code>[Worker Name]</code>
                  <code>[Branch Name]</code>
                </div>
              </Card>
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
