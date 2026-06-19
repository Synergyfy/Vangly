"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Send, Users, MessageSquare, Layout, History, 
  ChevronRight, Plus, Smartphone, Shield, 
  Clock, Info, Zap, User, ArrowLeft, 
  MapPin, UserPlus, Type, CheckCircle2, 
  X, Filter, LayoutTemplate, Wallet
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import "./messaging.css";

// --- Mock Data ---
const RECENT_MESSAGES = [
  { id: '1', title: 'Sunday Service Reminder', recipients: 1248, date: 'Oct 12, 10:30 AM', status: 'delivered', cost: '₦4,992', deliveryRate: '98%' },
  { id: '2', title: 'Workers Meeting', recipients: 85, date: 'Oct 10, 02:15 PM', status: 'sent', cost: '₦340', deliveryRate: '100%' },
  { id: '3', title: 'Welcome New Members', recipients: 12, date: 'Oct 09, 09:00 AM', status: 'delivered', cost: '₦48', deliveryRate: '92%' },
];

const TEMPLATES = [
  { id: 't1', name: 'First Timer Welcome', content: 'Hi {name}, we are so glad you joined us today at {organization}! We hope you had a great time.' },
  { id: 't2', name: 'Service Reminder', content: 'Hey {name}! Just a reminder that service starts at 9AM tomorrow at {location}. See you there!' },
  { id: 't3', name: 'Thank You', content: 'Dear {name}, thank you for your support. God bless you!' },
];

const LOCATIONS = [
  { id: 'l1', name: 'Northside Campus', contacts: 450, teams: 12 },
  { id: 'l2', name: 'Main HQ', contacts: 800, teams: 25 },
  { id: 'l3', name: 'East Valley', contacts: 120, teams: 5 },
];

const TEAMS = [
  { id: 't1', name: 'Evangelism Team', members: 25, contacts: 25 },
  { id: 't2', name: 'Youth Ministry', members: 150, contacts: 150 },
  { id: 't3', name: 'Volunteers', members: 85, contacts: 85 },
];

function MessagingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'flow' | 'history' | 'templates' | 'details'>('dashboard');
  const [step, setStep] = useState(1);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // App State
  const [availableCredits, setAvailableCredits] = useState(12450);
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);

  // Message Flow State
  const [recipientType, setRecipientType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>(['all']);
  const [message, setMessage] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Derived Values
  const charCount = message.length;
  const smsUnitsPerMsg = Math.ceil(charCount / 160) || 1;
  const estimatedRecipients = recipientType === 'organization' ? 1248 : (recipientType === 'location' ? 450 : (recipientType === 'team' ? 85 : 1));
  const totalUnitsNeeded = smsUnitsPerMsg * estimatedRecipients;
  const hasLowCredit = totalUnitsNeeded > availableCredits;

  // High Risk Logic
  const highRiskWords = ['urgent', 'immediate action', 'click here', 'prize', 'won', 'reward', 'verify', 'account blocked', 'password', 'congratulations', 'gift', 'claim'];
  const detectedRiskWords = highRiskWords.filter(word => message.toLowerCase().includes(word));
  const isHighRisk = detectedRiskWords.length > 0;

  const handleStartFlow = () => {
    setCurrentView('flow');
    setStep(1);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => {
    if (currentView === 'details') {
      setCurrentView('history');
      return;
    }
    if (currentView === 'flow') {
      if (step === 1) setCurrentView('dashboard');
      else if (step === 2 && (recipientType === 'organization' || recipientType === 'specific' || recipientType === 'manual')) setStep(1);
      else setStep(prev => prev - 1);
      return;
    }
    setCurrentView('dashboard');
  };

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + `{${variable}}`);
  };

  const openMessageDetails = (id: string) => {
    setSelectedMessageId(id);
    setCurrentView('details');
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
        
        <div className="sms-balance-card glass-morphism" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-light)' }}>
          <div className="balance-info">
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', margin: 0 }}>Credits</h3>
            <div className="balance-amount" style={{ fontSize: '20px', fontWeight: 800 }}>{availableCredits.toLocaleString()}</div>
          </div>
          <Button onClick={() => router.push('/main/wallet')} className="btn-premium" size="sm">
            Top Up
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="messaging-actions-hub-grid">
          {[
            { id: 'new', label: 'New Msg', icon: Send, action: handleStartFlow, color: 'blue' },
            { id: 'temp', label: 'Templates', icon: LayoutTemplate, action: () => setCurrentView('templates'), color: 'purple' },
            { id: 'up', label: 'Upload', icon: UserPlus, action: () => {}, color: 'green' },
            { id: 'hist', label: 'History', icon: History, action: () => setCurrentView('history'), color: 'orange' },
          ].map(action => (
            <Card 
              key={action.id} 
              className={`msg-hub-card ${action.color}`} 
              onClick={action.action}
            >
              <div className="msg-hub-icon">
                <action.icon size={24} />
              </div>
              <strong>{action.label}</strong>
            </Card>
          ))}
        </div>

      {/* Recent Messages */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('history')}>View All</Button>
        </div>

        <div className="team-grid-premium">
          {RECENT_MESSAGES.map(msg => (
            <Card key={msg.id} className="team-card-premium glass-morphism" style={{ padding: '16px !important' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{msg.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {msg.recipients} recipients • {msg.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>{msg.cost}</div>
                  <span className={`header-badge ${msg.status === 'sent' ? 'positive' : ''}`} style={{ fontSize: '9px', margin: 0, padding: '2px 8px' }}>
                    {msg.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );

  const renderFlow = () => {
    switch(step) {
      case 1: // Recipient Selection
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
                { id: 'team', title: 'By Team', desc: 'Message a specific outreach team or team.', icon: <Users size={32} /> },
                { id: 'specific', title: 'Specific People', desc: 'Search and pick individual contacts.', icon: <User size={32} /> },
                { id: 'upload', title: 'Upload Contacts', desc: 'Import numbers from a CSV or Excel file.', icon: <UserPlus size={32} /> },
                { id: 'manual', title: 'Type Phone Numbers', desc: 'Enter numbers manually separated by commas.', icon: <Type size={32} /> },
              ].map(type => (
                <div 
                  key={type.id} 
                  className={`recipient-type-card ${recipientType === type.id ? 'active' : ''}`}
                  onClick={() => {
                    setRecipientType(type.id);
                    if (type.id === 'organization' || type.id === 'specific' || type.id === 'manual') handleNext();
                    else handleNext(); // For location/team we'll go to selection steps
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
      case 2: // Sub-selection (Location or Group)
        if (recipientType === 'location') {
          return (
            <div className="messaging-hub">
              <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back</Button>
                <h1>Select Location</h1>
                <p>Choose the campus you want to message.</p>
              </div>
              <div className="recipient-cards-grid">
                {LOCATIONS.map(loc => (
                  <div key={loc.id} className="recipient-type-card" onClick={() => { setSelectedLocation(loc.name); handleNext(); }}>
                    <div className="recipient-icon-bg"><MapPin size={32} /></div>
                    <div className="recipient-info">
                      <h3>{loc.name}</h3>
                      <p>{loc.contacts} contacts • {loc.teams} teams</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (recipientType === 'team') {
          return (
            <div className="messaging-hub">
              <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back</Button>
                <h1>Select Team</h1>
                <p>Choose the specific team within your organization.</p>
              </div>
              <div className="recipient-cards-grid">
                {TEAMS.map(team => (
                  <div key={team.id} className="recipient-type-card" onClick={() => { setSelectedTeam(team.name); handleNext(); }}>
                    <div className="recipient-icon-bg"><Users size={32} /></div>
                    <div className="recipient-info">
                      <h3>{team.name}</h3>
                      <p>{team.members} members • {team.contacts} contacts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // Fallthrough if not location/team
        handleNext(); return null;

      case 3: // Filtering (Optional)
        return (
          <div className="messaging-hub">
             <div className="wizard-header">
                <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back</Button>
                <h1>Refine Your List</h1>
                <p>Apply filters to target specific people within your selection.</p>
              </div>
              <Card style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--ms-border)' }}>
                <div className="filter-chips" style={{ justifyContent: 'center' }}>
                  {['All Contacts', 'New Contacts', 'Attended Recently', 'Uncontacted', 'Regular Members'].map(f => (
                    <div 
                      key={f} 
                      className={`filter-chip ${filters.includes(f) ? 'active' : ''}`}
                      onClick={() => setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                    >
                      {f}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '40px' }}>
                  <Button className="btn-premium" size="lg" onClick={handleNext}>
                    Continue to Message <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </Button>
                </div>
              </Card>
          </div>
        );

      case 4: // Composer
        return (
          <div className="messaging-hub">
            <div className="wizard-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
               <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back</Button>
               <h1>Compose Your Message</h1>
            </div>

            <div className="composer-layout">
              <div className="composer-main">
                <div style={{ marginBottom: '24px' }}>
                  <Input 
                    label="Internal Message Title"
                    placeholder="e.g. Sunday Service Reminder" 
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>

                <div className="composer-toolbar-header">
                   <label>Message Body</label>
                   <Button variant="outline" size="sm" onClick={() => setMessage(TEMPLATES[0].content)}>
                      <LayoutTemplate size={14} style={{ marginRight: '6px' }} /> Use Template
                   </Button>
                </div>
                
                <textarea 
                  className="composer-textarea"
                  placeholder="Start typing your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <div className="variable-chips">
                  {['name', 'organization', 'location', 'date'].map(v => (
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
                    <Smartphone size={14} /> {smsUnitsPerMsg} Unit{smsUnitsPerMsg > 1 ? 's' : ''}
                  </div>
                  <div className="stat-pill primary">
                    <Users size={14} /> {totalUnitsNeeded.toLocaleString()} Total Units
                  </div>
                </div>

                <div className="composer-footer-actions" style={{ marginBottom: '16px' }}>
                  <Button variant="outline" className="mobile-preview-trigger lg:hidden" onClick={() => setShowPreview(true)}>
                    <Smartphone size={18} /> Preview
                  </Button>
                  <Button 
                    className="btn-premium" 
                    style={{ flex: 1 }} 
                    onClick={handleNext}
                    disabled={hasLowCredit}
                  >
                    Review & Send <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </Button>
                </div>

                <div className="high-risk-inline-warning">
                   <button className="view-risk-tag" onClick={() => setShowHighRiskModal(true)}>View</button>
                   <span className="risk-warning-text">
                     {isHighRisk 
                       ? "Message contains high-risk words that may affect delivery." 
                       : "Avoid high-risk words to ensure your message is delivered."}
                   </span>
                </div>

                {hasLowCredit && (
                   <Card className="low-credit-warning" style={{ marginTop: '16px' }}>
                      <div className="warning-content">
                        <Wallet size={20} className="text-danger" />
                        <div>
                          <strong>Insufficient Credits</strong>
                          <p>You need { (totalUnitsNeeded - availableCredits).toLocaleString() } more units to send this message.</p>
                        </div>
                      </div>
                      <Button className="btn-buy-mini" onClick={() => router.push(`/main/wallet?topup=${totalUnitsNeeded - availableCredits}`)}>
                        Top Up Now
                      </Button>
                   </Card>
                )}
              </div>

              {/* Desktop Live Preview */}
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

            {/* High Risk Modal */}
            {showHighRiskModal && (
              <div className="modal-overlay" onClick={() => setShowHighRiskModal(false)}>
                <Card className="high-risk-info-modal" onClick={e => e.stopPropagation()}>
                   <div className="modal-header">
                      <h3>High-Risk Words</h3>
                      <button className="close-btn" onClick={() => setShowHighRiskModal(false)}><X size={20} /></button>
                   </div>
                   <p>Using these words in your SMS may cause it to be flagged by telecom carriers and not delivered:</p>
                   <div className="risk-words-grid">
                      {highRiskWords.map(w => (
                        <div key={w} className={`risk-word ${message.toLowerCase().includes(w) ? 'detected' : ''}`}>
                          {w}
                        </div>
                      ))}
                   </div>
                   <Button fullWidth className="btn-premium" style={{ marginTop: '24px' }} onClick={() => setShowHighRiskModal(false)}>Got it</Button>
                </Card>
              </div>
            )}

            {/* Mobile Preview Modal */}
            {showPreview && (
              <div className="mobile-preview-overlay" onClick={() => setShowPreview(false)}>
                <div className="mobile-preview-content" onClick={e => e.stopPropagation()}>
                  <div className="close-preview" onClick={() => setShowPreview(false)}><X size={32} /></div>
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

      case 5: // Review
        return (
          <div className="messaging-hub">
            <div className="wizard-header">
              <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back</Button>
              <h1>Final Review</h1>
              <p>Please double-check everything before sending your broadcast.</p>
            </div>

            <div className="review-grid">
              <div className="review-summary-card">
                <div className="summary-item">
                  <span className="summary-label">Target Audience</span>
                  <span className="summary-value">{recipientType === 'organization' ? 'Entire Organization' : (selectedLocation || selectedTeam || 'Selected People')}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Recipients</span>
                  <span className="summary-value">{estimatedRecipients} contacts</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">SMS Units</span>
                  <span className="summary-value">{smsUnitsPerMsg} units / contact</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Units Required</span>
                  <span className="summary-value" style={{ color: 'var(--ms-primary)', fontSize: '20px' }}>{totalUnitsNeeded.toLocaleString()} Units</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Scheduled For</span>
                  <span className="summary-value">Immediate Delivery</span>
                </div>
                
                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <Button className="btn-premium" fullWidth size="lg" onClick={handleNext}>
                      <Send size={18} style={{ marginRight: '8px' }} /> Send Message Now
                   </Button>
                   <Button variant="outline" fullWidth size="lg">
                      <Clock size={18} style={{ marginRight: '8px' }} /> Schedule for Later
                   </Button>
                </div>
              </div>

              <div className="composer-main" style={{ opacity: 0.8 }}>
                 <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Message Preview</label>
                 <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', fontSize: '16px', lineHeight: '1.6', color: '#334155' }}>
                    {message}
                 </div>
              </div>
            </div>
          </div>
        );

      case 6: // Success
        return (
          <div className="messaging-hub">
            <div className="success-screen">
              <div className="success-icon-check">
                <CheckCircle2 size={64} />
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>Message Sent!</h1>
              <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '400px', margin: '0 auto 40px' }}>
                Your broadcast has been queued for delivery to <strong>{estimatedRecipients} contacts</strong>.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Button className="btn-premium" size="lg" onClick={() => setCurrentView('history')}>
                  View Report
                </Button>
                <Button variant="outline" size="lg" onClick={() => { setCurrentView('dashboard'); setStep(1); }}>
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  const renderHistory = () => (
    <div className="messaging-hub">
       <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Button variant="ghost" onClick={handleBack} style={{ paddingLeft: 0, marginBottom: '8px' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back
          </Button>
          <h1>Message History</h1>
        </div>
        <Button className="btn-premium" onClick={handleStartFlow}><Send size={18} style={{ marginRight: '8px' }} /> New Message</Button>
      </div>

      <div className="recent-messages-list">
        {[...RECENT_MESSAGES, ...RECENT_MESSAGES].map((msg, i) => (
          <div key={i} className="message-item-card">
            <div className="msg-main-info">
              <div className="msg-title">{msg.title}</div>
              <div className="msg-meta">
                <span style={{ color: 'var(--ms-primary)', fontWeight: 700 }}>{msg.deliveryRate} Delivery</span>
                <span>•</span>
                <span>{msg.recipients} recipients</span>
                <span>•</span>
                <span>{msg.date}</span>
                <span className={`msg-status ${msg.status}`}>{msg.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="msg-cost" style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '18px', fontWeight: 800 }}>{msg.cost}</div>
                 <div style={{ fontSize: '11px', opacity: 0.6 }}>Credits Used</div>
              </div>
              <Button variant="outline" size="sm" style={{ borderRadius: '12px' }} onClick={() => openMessageDetails(msg.id)}>Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessageDetails = () => {
    const msg = RECENT_MESSAGES.find(m => m.id === selectedMessageId) || RECENT_MESSAGES[0];
    return (
      <div className="messaging-hub">
        <div className="wizard-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <Button variant="ghost" onClick={handleBack} style={{ marginBottom: '16px' }}><ArrowLeft size={18} /> Back to History</Button>
          <h1>Message Report</h1>
          <p>Detailed delivery statistics for "{msg.title}"</p>
        </div>

        <div className="review-grid" style={{ marginBottom: '40px' }}>
          <div className="review-summary-card">
             <div className="summary-item">
                <span className="summary-label">Status</span>
                <span className={`msg-status ${msg.status}`}>{msg.status}</span>
             </div>
             <div className="summary-item">
                <span className="summary-label">Total Recipients</span>
                <span className="summary-value">{msg.recipients}</span>
             </div>
             <div className="summary-item">
                <span className="summary-label">Delivery Rate</span>
                <span className="summary-value" style={{ color: 'var(--ms-success)' }}>{msg.deliveryRate}</span>
             </div>
             <div className="summary-item">
                <span className="summary-label">Total Cost</span>
                <span className="summary-value">{msg.cost} Credits</span>
             </div>
             <div className="summary-item">
                <span className="summary-label">Sent Date</span>
                <span className="summary-value">{msg.date}</span>
             </div>
          </div>

          <Card style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--ms-border)' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Message Content</h3>
             <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>
                Hey {`{name}`}, just a reminder about our upcoming meeting. See you there!
             </div>
          </Card>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Delivery Logs</h2>
        <Card style={{ borderRadius: '24px', border: '1px solid var(--ms-border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontWeight: 700, fontSize: '13px', color: '#64748b' }}>
            <span>Recipient</span>
            <span>Phone</span>
            <span>Status</span>
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '14px' }}>
              <span style={{ fontWeight: 600 }}>John Doe {i}</span>
              <span style={{ color: '#64748b' }}>+234 803 000 000{i}</span>
              <span style={{ color: 'var(--ms-success)', fontWeight: 700 }}>Delivered</span>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  const renderTemplates = () => (
    <div className="messaging-hub">
       <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Button variant="ghost" onClick={handleBack} style={{ paddingLeft: 0, marginBottom: '8px' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back
          </Button>
          <h1>SMS Templates</h1>
        </div>
        <Button className="btn-premium"><Plus size={18} style={{ marginRight: '8px' }} /> Create Template</Button>
      </div>

      <div className="recipient-cards-grid">
        {TEMPLATES.map(t => (
          <div key={t.id} className="recipient-type-card">
            <div className="recipient-icon-bg"><LayoutTemplate size={32} /></div>
            <div className="recipient-info">
              <h3>{t.name}</h3>
              <p>{t.content}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
               <Button variant="outline" size="sm" style={{ flex: 1 }}>Edit</Button>
               <Button variant="ghost" size="sm" className="text-danger">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hq-dashboard-premium" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'flow' && renderFlow()}
      {currentView === 'history' && renderHistory()}
      {currentView === 'templates' && renderTemplates()}
      {currentView === 'details' && renderMessageDetails()}
    </div>
  );
}

export default function OrganizationMessagingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Messaging Center...</div>}>
      <MessagingContent />
    </Suspense>
  );
}
