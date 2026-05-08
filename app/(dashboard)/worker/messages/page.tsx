"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, History, User, ChevronDown, X, Layout, Search, CheckCircle2 } from 'lucide-react';
import './worker-messages.css';

export default function WorkerMessagingPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [selectedContacts, setSelectedContacts] = useState<typeof myContacts>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const myContacts = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Brown' },
    { id: '3', name: 'David Smith' },
  ];

  const templates = [
    { id: 't1', name: 'First Contact', content: 'Hi [Name], we are so glad you joined us today at [Church Name]!' },
    { id: 't2', name: 'Follow-up', content: 'Hello [Name], we missed you at service today. Hope everything is well.' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleContact = (contact: typeof myContacts[0]) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    if (templateId !== 'none') {
      const template = templates.find(t => t.id === templateId);
      if (template) setMessageContent(template.content);
    } else {
      setMessageContent('');
    }
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Messaging Center</div>
          <h1>Outreach Messaging</h1>
          <p>Follow up with your contacts and maintain connections.</p>
        </div>
      </div>

      <div className="messaging-tabs">
        <button className={activeTab === 'compose' ? 'active' : ''} onClick={() => setActiveTab('compose')}>
          <Send size={18} /> Compose
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          <History size={18} /> Sent History
        </button>
      </div>

      <div className="messaging-content-layout">
        {activeTab === 'compose' && (
          <div className="compose-grid">
            <Card className="compose-main-card">
              <div className="compose-form">
                <div className="form-group-premium" ref={dropdownRef}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Select Contacts</label>
                  <div className={`dropdown-wrapper ${isDropdownOpen ? 'active' : ''}`}>
                    <div 
                      className="dropdown-trigger" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                    >
                      {selectedContacts.length > 0 ? (
                        <div className="selected-tags">
                          {selectedContacts.map(c => (
                            <span key={c.id} className="contact-tag">
                              {c.name}
                              <X size={12} onClick={(e) => { e.stopPropagation(); toggleContact(c); }} />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="placeholder" style={{ color: 'var(--text-tertiary)' }}>Who are you following up with?</span>
                      )}
                      <ChevronDown size={16} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                           <div style={{ position: 'relative' }}>
                             <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                             <input 
                               placeholder="Search contacts..." 
                               style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', fontSize: '0.8rem', border: '1px solid var(--border-light)', borderRadius: '6px', outline: 'none' }}
                               onClick={(e) => e.stopPropagation()}
                             />
                           </div>
                        </div>
                        {myContacts.map(contact => {
                          const isSelected = selectedContacts.find(c => c.id === contact.id);
                          return (
                            <div 
                              key={contact.id} 
                              className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleContact(contact);
                              }}
                            >
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isSelected ? 'var(--blue)' : 'var(--bg)', color: isSelected ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                {contact.name.charAt(0)}
                              </div>
                              <span style={{ flex: 1 }}>{contact.name}</span>
                              {isSelected && <CheckCircle2 size={14} style={{ color: 'var(--blue)' }} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group-premium">
                  <label><Layout size={14} /> Message Template</label>
                  <select value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="none">Custom Message</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="form-group-premium">
                  <label>Message Content</label>
                  <textarea 
                    className="message-textarea"
                    rows={8}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                  />
                  <div className="textarea-footer">
                    <span>160 characters per SMS</span>
                    <span>{messageContent.length}/160</span>
                  </div>
                </div>

                <Button className="btn-premium" style={{ width: '100%' }}>
                  <Send size={18} /> Send to {selectedContacts.length} Contacts
                </Button>
              </div>
            </Card>

            <div className="compose-side-panels">
              <Card className="summary-card-premium">
                <h3>Quick Stats</h3>
                <div className="summary-list">
                  <div className="summary-row">
                    <span>Selected</span>
                    <strong>{selectedContacts.length} people</strong>
                  </div>
                  <div className="summary-row">
                    <span>Cost</span>
                    <strong className="text-primary">{selectedContacts.length} Credits</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
