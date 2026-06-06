"use client";

import React, { useState } from "react";
import {
  Send,
  User,
  Search,
  Plus,
  Smile,
  Zap,
  Clock,
  Info,
  Smartphone,
  ChevronDown,
  AlertCircle,
  Users,
  Trash2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import "./worker-messages.css";

export default function WorkerMessagingPage() {
  const [recipientTab, setRecipientTab] = useState("all");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("none");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const myContacts = [
    { id: "c1", name: "Adrian Walker", phone: "+1 (555) 012-4456", initials: "AW" },
    { id: "c2", name: "Elena Rodriguez", phone: "+1 (555) 882-9901", initials: "ER" },
    { id: "c3", name: "Marcus Chen", phone: "+1 (555) 234-5678", initials: "MC" },
    { id: "c4", name: "Jordan Smith", phone: "+1 (555) 345-6789", initials: "JS" },
    { id: "c5", name: "Sarah K.", phone: "+1 (555) 998-0011", initials: "SK" },
  ];

  const templates = [
    {
      id: "t1",
      name: "Follow-up",
      content: "Hi [Name], it was great seeing you today! Hope you had a blessed time.",
    },
    {
      id: "t2",
      name: "Reminder",
      content: "Hey [Name], just checking in to see if you're still available for our meet-up tomorrow?",
    },
  ];

  const emojis = ["😊", "😂", "🥰", "🙌", "🙏", "✨", "🔥", "❤️", "👍", "👋", "🎉", "📢", "⛪", "🏠", "📍"];

  // Derived stats
  const characterCount = message.length;
  const smsUnits = Math.ceil(characterCount / 160) || 1;
  const costPerSms = 4.0; // Naira cost
  const totalCost = (selectedContacts.length || 45) * smsUnits * costPerSms; // Mocking 45 if "All" is selected

  const isHighRisk =
    message.toLowerCase().includes("immediate action") ||
    message.toLowerCase().includes("urgent") ||
    message.toLowerCase().includes("click here");

  return (
    <div className="worker-messaging-page">
      <div className="dashboard-header">
        <div className="header-badge" style={{ background: 'var(--blue-subtle)', color: 'var(--blue)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>
          OUTREACH HUB
        </div>
        <h1>Worker Messaging</h1>
        <p>Personalized outreach to your assigned contacts.</p>
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
                <span className="selected-count">All Assigned Contacts Selected</span>
                <div className="selected-tags">
                  <span className="selected-tag">45 Assigned Members</span>
                  <span className="selected-tag">Recent Contacts Included</span>
                </div>
              </div>
            ) : (
              selectedContacts.length > 0 && (
                <div className="selected-groups-display">
                  <span className="selected-count">{selectedContacts.length} Contacts Selected</span>
                  <div className="selected-tags">
                    {selectedContacts.slice(0, 3).map(id => {
                      const contact = myContacts.find(c => c.id === id);
                      return <span key={id} className="selected-tag">{contact?.name}</span>;
                    })}
                    {selectedContacts.length > 3 && (
                      <span className="selected-tag more">+{selectedContacts.length - 3} more</span>
                    )}
                    <button className="btn-edit-selection" onClick={() => setIsContactModalOpen(true)}>Edit</button>
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
                placeholder="Type your outreach message here..."
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
                  <strong>High Risk Content</strong>
                  <p>Your message may be flagged by carriers. Avoid urgent phrases or suspicious links.</p>
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

          <Card style={{ padding: '1.5rem', background: 'white', marginTop: '24px' }}>
            <span className="section-label">Messaging Tips</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '12px' }}>
              <Sparkles size={16} style={{ color: 'var(--blue)', marginTop: '2px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Personalize your messages using names for better engagement rates.
              </p>
            </div>
          </Card>
        </div>

        {/* Sticky Footer */}
        <div className="messaging-footer-v2">
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-label">Recipients</span>
              <span className="footer-stat-value">{recipientTab === "all" ? 45 : selectedContacts.length}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-label">Total Credits</span>
              <span className="footer-stat-value">₦{totalCost.toFixed(2)}</span>
            </div>
          </div>
          <div className="footer-actions">
            <button className="btn-send-v2">
              <Send size={20} />
              Send Outreach
            </button>
          </div>
        </div>
      </div>

      {/* Contact Selection Modal */}
      {isContactModalOpen && (
        <div className="modal-overlay">
          <div className="selection-modal">
            <div className="modal-header-v2">
              <div className="search-bar-v2" style={{ flex: 1 }}>
                <Search className="search-icon" size={20} />
                <input type="text" placeholder="Search your contacts..." />
              </div>
            </div>

            <div className="selection-table-container">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                    <th>Contact Name</th>
                    <th>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {myContacts.map(contact => (
                    <tr 
                      key={contact.id} 
                      className={selectedContacts.includes(contact.id) ? 'selected' : ''}
                      onClick={() => {
                        if (selectedContacts.includes(contact.id)) {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        } else {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        }
                      }}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(contact.id)}
                          readOnly
                        />
                      </td>
                      <td>
                        <div className="group-cell">
                          <div className="group-avatar" style={{ borderRadius: '50%' }}>{contact.initials}</div>
                          {contact.name}
                        </div>
                      </td>
                      <td>{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-v2">
              <div className="footer-left">
                <div className="count-pill">{selectedContacts.length} selected</div>
                <button className="btn-clear" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelectedContacts([])}>
                  <Trash2 size={16} /> Clear Selection
                </button>
              </div>
              <button className="btn-confirm" onClick={() => setIsContactModalOpen(false)}>
                Confirm Selection <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
