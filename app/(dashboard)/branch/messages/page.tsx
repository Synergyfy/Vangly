"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Users, 
  Building2, 
  Send, 
  CheckCircle2, 
  Smartphone,
  Eye,
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './branch-messages.css';

export default function BranchMessagingPage() {
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [target, setTarget] = useState<'entire' | 'groups'>('entire');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const groups = [
    { id: '1', name: 'Evangelism Team' },
    { id: '2', name: 'Follow-up Team' },
    { id: '3', name: 'Downtown Outreach' },
    { id: '4', name: 'Youth Workers' }
  ];

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setMessage('');
      setSubject('');
    }, 1500);
  };

  const toggleGroup = (id: string) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter(g => g !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  return (
    <div className="branch-messages-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Communication Center</h1>
            <p>Engage your entire branch or target specific teams with SMS and Email.</p>
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
      </div>

      <div className="messaging-layout">
        <div className="composer-container">
          <div className="channel-tabs">
            <div className={`channel-tab ${channel === 'sms' ? 'active' : ''}`} onClick={() => setChannel('sms')}>
              <Smartphone size={18} />
              SMS Message
            </div>
            <div className={`channel-tab ${channel === 'email' ? 'active' : ''}`} onClick={() => setChannel('email')}>
              <Mail size={18} />
              Direct Email
            </div>
          </div>

          <Card className="composer-card">
            <div className="composer-section">
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>Who are you messaging?</label>
                <div className="targeting-options">
                  <div 
                    className={`target-card ${target === 'entire' ? 'active' : ''}`}
                    onClick={() => setTarget('entire')}
                  >
                    <Building2 size={20} style={{ color: target === 'entire' ? 'var(--blue)' : 'var(--text-tertiary)' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Entire Branch</div>
                  </div>
                  <div 
                    className={`target-card ${target === 'groups' ? 'active' : ''}`}
                    onClick={() => setTarget('groups')}
                  >
                    <Users size={20} style={{ color: target === 'groups' ? 'var(--blue)' : 'var(--text-tertiary)' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Specific Groups</div>
                  </div>
                </div>
              </div>

              {target === 'groups' && (
                <div className="fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {groups.map(group => (
                    <div 
                      key={group.id} 
                      className={`group-select-chip ${selectedGroups.includes(group.id) ? 'active' : ''}`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      {selectedGroups.includes(group.id) ? <CheckCircle2 size={16} /> : <Users size={16} />}
                      {group.name}
                    </div>
                  ))}
                </div>
              )}

              {channel === 'email' && (
                <div className="fade-in">
                  <Input 
                    label="Subject Line" 
                    placeholder="e.g. Important Update for the Team" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Message Content</label>
                <textarea 
                  className="message-textarea" 
                  placeholder={channel === 'sms' ? "Type your text message here..." : "Draft your email message..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {channel === 'sms' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>{message.length} characters</span>
                    <span>{Math.ceil(message.length / 160)} SMS Credits</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                  <Sparkles size={14} />
                  <span>Use variables like <strong>{"{name}"}</strong> to personalize.</span>
                </div>
                <Button 
                  className="btn-premium" 
                  style={{ gap: '0.75rem', padding: '0.75rem 2rem' }}
                  disabled={!message || isSending || (target === 'groups' && selectedGroups.length === 0)}
                  onClick={handleSend}
                >
                  <Send size={18} />
                  {isSending ? 'Sending Pulse...' : 'Send Broadcast'}
                </Button>
              </div>
            </div>
          </Card>

          {success && (
            <div className="fade-in" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--green-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--green)' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Broadcast sent successfully!</span>
            </div>
          )}
        </div>

        <div className="preview-sidebar">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} style={{ color: 'var(--blue)' }} />
            Live Preview
          </h3>
          
          <div className="phone-mockup">
            <div className="phone-power-btn" />
            <div className="phone-screen">
              <div className="phone-status-bar">
                <span>9:41</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'black', borderRadius: '2px' }} />
                  <div style={{ width: '12px', height: '12px', background: 'black', borderRadius: '2px' }} />
                </div>
              </div>
              
              {channel === 'sms' ? (
                <div className="sms-bubble fade-in">
                  {message || "Start typing to see your SMS preview..."}
                </div>
              ) : (
                <div className="email-preview-box fade-in">
                  <div className="email-subject-line">{subject || "No Subject"}</div>
                  <div className="email-body-text">
                    {message || "Draft your email to see a preview here..."}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Card style={{ padding: '1rem', background: 'var(--surface-secondary)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Info size={16} style={{ color: 'var(--text-tertiary)', marginTop: '2px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Messages are sent immediately. Ensure you have selected the correct target audience before broadcasting.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reuse the chip style from groups or define locally
const Plus = ({ size, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
