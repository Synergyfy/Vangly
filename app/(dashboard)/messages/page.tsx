"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Send } from 'lucide-react';
import './messages.css';

function MessagesContent() {
  const searchParams = useSearchParams();
  const [msgType, setMsgType] = useState('sms');
  const [recipients, setRecipients] = useState('all_invites');
  const [customRecipient, setCustomRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle incoming query params for pre-selecting a recipient
  useEffect(() => {
    const recipient = searchParams.get('recipient');
    const mode = searchParams.get('mode');

    if (mode === 'custom') {
      setRecipients('custom');
      if (recipient) {
        setCustomRecipient(recipient);
      }
    } else if (mode === 'all_invites') {
      setRecipients('all_invites');
    } else if (mode === 'attended_only') {
      setRecipients('attended_only');
    } else if (mode === 'not_attended') {
      setRecipients('not_attended');
    }
  }, [searchParams]);

  // Mock credits
  const credits = {
    sms: 1250,
    email: 5000,
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Mock send
    setTimeout(() => {
      setIsSending(false);
      setSuccess(true);
      setMessage('');
      if (recipients !== 'custom') {
         setCustomRecipient('');
      }
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="messages-page">
      <div className="page-header flex-between">
        <div>
          <h1>Messaging Center</h1>
          <p>Send follow-up messages to your contacts.</p>
        </div>
        <div className="credits-display">
          <div className="credit-pill">
            <span className="credit-label">SMS Credits:</span>
            <span className="credit-value">{credits.sms}</span>
          </div>
          <div className="credit-pill">
            <span className="credit-label">Email Credits:</span>
            <span className="credit-value">{credits.email}</span>
          </div>
          <Button variant="outline" size="sm">Buy Credits</Button>
        </div>
      </div>

      <div className="messaging-container">
        <Card className="compose-card">
          <h2>Compose Message</h2>
          
          {success && (
            <div className="success-alert">
              <CheckCircle2 size={18} /> Message successfully sent to recipients!
            </div>
          )}

          <form onSubmit={handleSend} className="compose-form">
            <div className="form-row">
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="msg-type">Message Type</label>
                <select 
                  id="msg-type"
                  className="input-field select-field"
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value)}
                >
                  <option value="sms">SMS Text Message</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp (Coming Soon)</option>
                </select>
              </div>

              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="recipients">Recipients</label>
                <select 
                  id="recipients"
                  className="input-field select-field"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                >
                  <option value="all_invites">All My Invites</option>
                  <option value="attended_only">Only those who attended</option>
                  <option value="not_attended">Only those who haven't attended</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>
            </div>

            {recipients === 'custom' && (
              <Input 
                label="Recipient Phone/Email" 
                placeholder="e.g. +1 234 567 8900" 
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                required 
              />
            )}

            {msgType === 'email' && (
              <Input label="Email Subject" placeholder="e.g. Thanks for coming!" required />
            )}

            <div className="input-wrapper input-full">
              <label className="input-label" htmlFor="message-body">Message Content</label>
              <textarea 
                id="message-body"
                className="input-field textarea-field"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
              {msgType === 'sms' && (
                <span className="char-count">{message.length} / 160 characters (1 SMS)</span>
              )}
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={!message || (recipients === 'custom' && !customRecipient) || isSending} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} /> {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading messaging center...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
