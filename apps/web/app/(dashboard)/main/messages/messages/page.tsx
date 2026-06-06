"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '@/services/auth';
import { authKeys } from '@/lib/api/queries/auth.keys';
import './messages.css';

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  
  const [msgType, setMsgType] = useState('sms');
  const [recipients, setRecipients] = useState('all_invites');
  const [customRecipient, setCustomRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check credits
    if (msgType === 'sms' && (!user || user.credits < 1)) {
      setError("You don't have enough SMS credits. Please top up your wallet.");
      return;
    }

    setIsSending(true);
    setError(null);

    // Mock send
    setTimeout(() => {
      setIsSending(false);
      
      if (user) {
        // Deduct 1 credit per send for now (simplified). The real backend
        // returns the authoritative balance on the next /me fetch.
        qc.setQueryData(authKeys.me(), {
          ...user,
          credits: user.credits - (msgType === 'sms' ? 1 : 0),
        });
      }

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
            <span className="credit-label">Available SMS Credits:</span>
            <span className="credit-value">{user?.credits || 0}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/worker/top-up')}>Buy Credits</Button>
        </div>
      </div>

      <div className="messaging-container">
        <Card className="compose-card">
          <h2>Compose SMS Message</h2>
          
          {success && (
            <div className="success-alert">
              <CheckCircle2 size={18} /> SMS successfully sent to recipients!
            </div>
          )}

          {error && (
            <div className="error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSend} className="compose-form">
            <div className="form-row">
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="msg-type">Communication Channel</label>
                <select 
                  id="msg-type"
                  className="input-field select-field"
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value)}
                >
                  <option value="sms">SMS Text Message</option>
                  <option value="whatsapp" disabled>WhatsApp (Coming Soon)</option>
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
                label="Recipient Phone Number" 
                placeholder="e.g. +234 800 000 0000" 
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                required 
              />
            )}

            <div className="input-wrapper input-full">
              <label className="input-label" htmlFor="message-body">Message Content</label>
              <textarea 
                id="message-body"
                className="input-field textarea-field"
                placeholder="Type your SMS message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
              <span className="char-count">{message.length} / 160 characters (1 SMS)</span>
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
