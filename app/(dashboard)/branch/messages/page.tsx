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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("none");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const branchTeams = [
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
      content: "Welcome to the team! We're excited to have you serving with us today at Downtown HQ.",
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
  const estimatedCost = (smsUnits * 452 * 4).toLocaleString();
  
  const isHighRisk =
    message.toLowerCase().includes("immediate action") ||
    message.toLowerCase().includes("urgent") ||
    message.toLowerCase().includes("click here");

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
              <span>1.2k SMS Units</span>
           </Card>
        </div>
      </header>

      <div className="messaging-v2-container">
        <div className="messaging-v2-main">
          {/* Recipient Selection */}
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
                <span className="selected-count">Broadcasting to All Members</span>
                <div className="selected-tags">
                  <span className="selected-tag">Downtown HQ Hub</span>
                  <span className="selected-tag">All Outreach Teams</span>
                </div>
              </div>
            ) : (
              selectedTeams.length > 0 && (
                <div className="selected-groups-display">
                  <span className="selected-count">{selectedTeams.length} Teams Selected</span>
                  <div className="selected-tags">
                    {selectedTeams.slice(0, 3).map(id => {
                      const team = branchTeams.find(g => g.id === id);
                      return <span key={id} className="selected-tag">{team?.name}</span>;
                    })}
                    {selectedTeams.length > 3 && (
                      <span className="selected-tag more">+{selectedTeams.length - 3} more</span>
                    )}
                    <button className="btn-edit-selection" onClick={() => setIsTeamModalOpen(true)}>Change Selection</button>
                  </div>
                </div>
              )
            )}
          </section>

          {/* SMS Composer */}
          <section className="messaging-section-card">
            <div className="composer-header">
              <span className="section-label" style={{ marginBottom: 0 }}>SMS Composer</span>
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
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                >
                  <option value="none">Quick Templates</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span>{selectedTemplate === "none" ? "Use Template" : templates.find(t => t.id === selectedTemplate)?.name}</span>
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="textarea-wrapper-v2">
              <textarea
                className="composer-textarea-v2"
                placeholder="Type your broadcast message here..."
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
                    <div className="emoji-picker-simple fade-in">
                      {emojis.map(emoji => (
                        <span key={emoji} onClick={() => { setMessage(prev => prev + emoji); setShowEmojiPicker(false); }}>{emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                  <p>Your message contains keywords that may be flagged by carrier filters. Consider rephrasing for better deliverability.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="messaging-v2-sidebar">
          <div className="phone-preview-v2">
            <div className="phone-screen-v2">
              <div className="phone-header-v2">
                <div className="phone-avatar-v2"><Building2 size={16} /></div>
                <span className="phone-number-v2">Downtown HQ</span>
              </div>
              <div className="phone-chat-v2">
                <div className="chat-bubble-v2">
                  {message || "Message preview will appear here..."}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Sticky Footer */}
        <div className="messaging-footer-v2">
          <div className="footer-stats">
            <div className="footer-stat">
               <span className="footer-stat-label">Recipients</span>
               <span className="footer-stat-value">1,248</span>
            </div>
            <div className="footer-stat">
               <span className="footer-stat-label">Estimated Cost</span>
               <span className="footer-stat-value">₦{estimatedCost}</span>
            </div>
          </div>
          <div className="footer-actions">
            <Button variant="outline" size="lg" className="btn-schedule-v2"><Clock size={20} /> Schedule</Button>
            <Button size="lg" className="btn-send-v2"><Send size={20} /> Send Broadcast</Button>
          </div>
        </div>
      </div>

      {/* Team Selection Modal */}
      {isTeamModalOpen && (
        <div className="modal-overlay-premium fade-in">
          <div className="selection-modal">
            <div className="modal-header-v2">
              <div className="search-bar-v2" style={{ flex: 1 }}>
                <Search className="search-icon" size={20} />
                <input type="text" placeholder="Search outreach teams..." />
              </div>
            </div>

            <div className="selection-table-container">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                    <th>Outreach Team</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {branchTeams.map(team => (
                    <tr 
                      key={team.id} 
                      className={selectedTeams.includes(team.id) ? 'selected' : ''}
                      onClick={() => {
                        if (selectedTeams.includes(team.id)) {
                          setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                        } else {
                          setSelectedTeams([...selectedTeams, team.id]);
                        }
                      }}
                    >
                      <td><input type="checkbox" checked={selectedTeams.includes(team.id)} readOnly /></td>
                      <td>
                        <div className="group-cell">
                          <div className="group-avatar">{team.initials}</div>
                          {team.name}
                        </div>
                      </td>
                      <td>{team.members} Active Members</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer-v2">
              <div className="footer-left">
                <div className="count-pill">{selectedTeams.length} teams selected</div>
              </div>
              <div className="footer-actions">
                <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>Cancel</Button>
                <Button className="btn-premium" onClick={() => setIsTeamModalOpen(false)}>Confirm Selection</Button>
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
