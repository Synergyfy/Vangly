"use client";

import React, { useState } from "react";
import {
  Send,
  Users,
  MessageSquare,
  Mail,
  Search,
  Plus,
  Shield,
  Edit3,
  Trash2,
  Smile,
  Zap,
  Clock,
  Info,
  Smartphone,
  ChevronDown,
  User,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import "./branch-messages.css";

export default function BranchMessagingPage() {
  const [recipientTab, setRecipientTab] = useState("all");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("none");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const branchGroups = [
    { id: "g1", name: "Evangelism Team", members: 24, initials: "ET" },
    { id: "g2", name: "Follow-up Team", members: 12, initials: "FT" },
    { id: "g3", name: "Downtown Outreach", members: 45, initials: "DO" },
    { id: "g4", name: "Youth Workers", members: 18, initials: "YW" },
    { id: "g5", name: "Worship Team", members: 30, initials: "WT" },
  ];

  const emojis = ["😊", "😂", "🥰", "🙌", "🙏", "✨", "🔥", "❤️", "👍", "👋", "🎉", "📢", "⛪", "🏠", "📍"];

  const templates = [
    {
      id: "t1",
      name: "Team Welcome",
      content: "Welcome to the team! We're excited to have you serving with us today at [Branch Name].",
    },
    {
      id: "t2",
      name: "Shift Reminder",
      content: "Hi [Name], just a reminder of your serving shift tomorrow at 9 AM. See you there!",
    },
  ];

  // Derived stats
  const characterCount = message.length;
  const smsUnits = Math.ceil(characterCount / 160) || 1;
  const costPerSms = 4.0; // Naira cost
  const estimatedCost = (smsUnits * 452 * costPerSms).toLocaleString(); // Mock 452 recipients for this branch
  
  const isHighRisk =
    message.toLowerCase().includes("immediate action") ||
    message.toLowerCase().includes("urgent") ||
    message.toLowerCase().includes("click here");

  return (
    <div className="branch-messages-page">
      <div className="dashboard-header flex-between">
        <div className="header-main">
          <h1>Communication Center</h1>
          <p>
            Engage your entire branch or target specific teams with SMS and Email.
          </p>
        </div>
        <Card style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--blue-subtle)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase' }}>Available Credits</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--blue)' }}>1,250 SMS / 5,000 Email</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(0,122,255,0.2)' }} />
          <Button variant="ghost" size="sm" style={{ padding: '0.25rem', color: 'var(--blue)' }}>
            <Plus size={16} />
          </Button>
        </Card>
      </div>

      <div className="messaging-v2-container">
        <div className="messaging-v2-main">
          {/* Recipient Selection */}
          <div className="messaging-section-card">
            <span className="section-label">Recipient Selection</span>
            <div className="recipient-selection-header" style={{ marginBottom: '16px' }}>
              <div className="recipient-tabs">
                <div
                  className={`recipient-tab ${recipientTab === "all" ? "active" : ""}`}
                  onClick={() => setRecipientTab("all")}
                >
                  All
                </div>
                <div
                  className={`recipient-tab ${recipientTab === "groups" ? "active" : ""}`}
                  onClick={() => {
                    setRecipientTab("groups");
                    setIsGroupModalOpen(true);
                  }}
                >
                  Groups
                </div>
              </div>
            </div>
            {recipientTab === "all" ? (
              <div className="selected-groups-display">
                <span className="selected-count">Full Audience Selected</span>
                <div className="selected-tags">
                  <span className="selected-tag">Entire Branch Hub</span>
                  <span className="selected-tag">All Members</span>
                  <span className="selected-tag">All Workers</span>
                </div>
              </div>
            ) : (
              selectedGroups.length > 0 && (
                <div className="selected-groups-display">
                  <span className="selected-count">{selectedGroups.length} Groups Selected</span>
                  <div className="selected-tags">
                    {selectedGroups.slice(0, 3).map(id => {
                      const group = branchGroups.find(g => g.id === id);
                      return <span key={id} className="selected-tag">{group?.name}</span>;
                    })}
                    {selectedGroups.length > 3 && (
                      <span className="selected-tag more">+{selectedGroups.length - 3} more</span>
                    )}
                    <button className="btn-edit-selection" onClick={() => setIsGroupModalOpen(true)}>Edit</button>
                  </div>
                </div>
              )
            )}
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
                  {characterCount} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>/ 160</span>
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
                <span className="phone-number-v2">Branch Hub</span>
              </div>
              <div className="phone-chat-v2">
                <div className="chat-bubble-v2">
                  {message ||
                    "Start typing to see your message preview here..."}
                </div>
                <span className="chat-time-v2">Now · SMS</span>
              </div>
            </div>
          </div>

          <div className="delivery-estimate-card">
            <span className="section-label">Estimated Delivery</span>
            <div className="estimate-row">
              <div className="estimate-label">
                <Zap size={18} style={{ color: 'var(--blue)' }} />
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
              <Info size={18} style={{ color: 'var(--blue)' }} />
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
              Send Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* Group Selection Modal */}
      {isGroupModalOpen && (
        <div className="modal-overlay">
          <div className="selection-modal">
            <div className="modal-header-v2">
              <div className="search-bar-v2" style={{ flex: 1 }}>
                <Search className="search-icon" size={20} />
                <input type="text" placeholder="Search by team name..." />
              </div>
            </div>

            <div className="selection-table-container">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                    <th>Group Name</th>
                    <th>Numbers of Workers</th>
                  </tr>
                </thead>
                <tbody>
                  {branchGroups.map(group => (
                    <tr 
                      key={group.id} 
                      className={selectedGroups.includes(group.id) ? 'selected' : ''}
                      onClick={() => {
                        if (selectedGroups.includes(group.id)) {
                          setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                        } else {
                          setSelectedGroups([...selectedGroups, group.id]);
                        }
                      }}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedGroups.includes(group.id)}
                          readOnly
                        />
                      </td>
                      <td>
                        <div className="group-cell">
                          <div className="group-avatar">{group.initials}</div>
                          {group.name}
                        </div>
                      </td>
                      <td>{group.members} Workers</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-v2">
              <div className="footer-left">
                <div className="count-pill">{selectedGroups.length} selected</div>
                <button className="btn-clear" onClick={() => setSelectedGroups([])}>
                  <Trash2 size={16} /> Clear Selection
                </button>
              </div>
              <div className="footer-actions">
                <button className="btn-cancel" onClick={() => setIsGroupModalOpen(false)}>Cancel</button>
                <button className="btn-confirm" onClick={() => setIsGroupModalOpen(false)}>
                  Confirm Selection <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reuse the chevron right for the modal
const ChevronRight = ({ size, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
