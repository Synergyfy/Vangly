"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { Send } from 'lucide-react';
import { useWalletBalance } from '@/services/wallet';
import { useSendMessage } from '@/services/messages';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { isE164, isValidMessageBody, toE164 } from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import './messages.css';

const SUPPORTED_RECIPIENT_MODES = new Set([
  'all_invites',
  'attended_only',
  'not_attended',
  'custom',
]);

type RecipientMode = 'all_invites' | 'attended_only' | 'not_attended' | 'custom';

function pickInitialMode(raw: string | null): RecipientMode {
  if (raw && SUPPORTED_RECIPIENT_MODES.has(raw)) {
    return raw as RecipientMode;
  }
  return 'all_invites';
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const balanceQuery = useWalletBalance();
  const sendMessage = useSendMessage();

  const initialMode = pickInitialMode(searchParams.get('mode'));
  const initialRecipient = searchParams.get('recipient') ?? '';

  const [recipients, setRecipients] = useState<RecipientMode>(initialMode);
  const [customRecipient, setCustomRecipient] = useState<string>(initialRecipient);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSending = sendMessage.isPending;
  const creditBalance = balanceQuery.data?.balance ?? 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAll();

    if (!isValidMessageBody(message)) {
      setError(
        'message',
        'Enter a message up to 1600 characters (concatenated SMS).',
      );
      return;
    }

    if (recipients !== 'custom') {
      toast.info('For mass sending, use the Messaging wizard.', {
        action: {
          label: 'Open wizard',
          onClick: () => router.push('/main/messages'),
        },
      });
      return;
    }

    const phone = toE164('', customRecipient.trim());
    if (!isE164(phone)) {
      setError(
        'customRecipient',
        'Enter a valid phone number, e.g. +2348012345678.',
      );
      return;
    }

    if (creditBalance < 1) {
      toast.error("You don't have enough SMS credits. Please top up your wallet.", {
        action: {
          label: 'Top up',
          onClick: () => router.push('/main/wallet'),
        },
      });
      return;
    }

    try {
      const result = await sendMessage.mutateAsync({
        recipients: [{ phone }],
        body: message,
      });
      setSuccessResult({
        sent: result.sent,
        failed: result.failed,
        total: result.total,
      });
      setMessage('');
      setCustomRecipient('');
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not send your message.'));
    }
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
            <span className="credit-value">
              {balanceQuery.isLoading ? '—' : creditBalance.toLocaleString()}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/main/wallet')}>
            Buy Credits
          </Button>
        </div>
      </div>

      <div className="messaging-container">
        <Card className="compose-card">
          <h2>Compose SMS Message</h2>

          <form onSubmit={handleSend} className="compose-form">
            <div className="form-row">
              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="msg-type">
                  Communication Channel
                </label>
                <select
                  id="msg-type"
                  className="input-field select-field"
                  defaultValue="sms"
                >
                  <option value="sms">SMS Text Message</option>
                  <option value="whatsapp" disabled>
                    WhatsApp (Coming Soon)
                  </option>
                </select>
              </div>

              <div className="input-wrapper input-full">
                <label className="input-label" htmlFor="recipients">
                  Recipients
                </label>
                <select
                  id="recipients"
                  className="input-field select-field"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value as RecipientMode)}
                >
                  <option value="all_invites">All My Invites (use wizard)</option>
                  <option value="attended_only">Only those who attended (use wizard)</option>
                  <option value="not_attended">Only those who have not attended (use wizard)</option>
                  <option value="custom">Custom Phone Number</option>
                </select>
              </div>
            </div>

            {recipients === 'custom' && (
              <Input
                label="Recipient Phone Number"
                placeholder="e.g. +234 800 000 0000"
                value={customRecipient}
                onChange={(e) => {
                  setCustomRecipient(e.target.value);
                  if (errors['customRecipient']) clearAll();
                }}
                error={errors['customRecipient']}
                disabled={isSending}
                required
              />
            )}

            <div className="input-wrapper input-full">
              <label className="input-label" htmlFor="message-body">
                Message Content
              </label>
              <textarea
                id="message-body"
                className="input-field textarea-field"
                placeholder="Type your SMS message here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors['message']) clearAll();
                }}
                rows={6}
                disabled={isSending}
                required
              />
              {errors['message'] && (
                <span className="input-error-text">{errors['message']}</span>
              )}
              <span className="char-count">
                {message.length} / 160 characters (1 SMS)
              </span>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                disabled={
                  isSending ||
                  !message ||
                  (recipients === 'custom' && !customRecipient.trim())
                }
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={18} />{' '}
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="send"
        title="Message Sent!"
        description={
          successResult
            ? `Delivered to ${successResult.sent} of ${successResult.total} recipient${
                successResult.total === 1 ? '' : 's'
              }${
                successResult.failed > 0
                  ? `. ${successResult.failed} failed.`
                  : '.'
              }`
            : 'Your message has been queued for delivery.'
        }
        primaryAction={{
          label: 'Send Another',
          onClick: () => {
            setShowSuccess(false);
          },
        }}
        secondaryAction={{
          label: 'View History',
          navigateTo: '/main/messages?view=history',
        }}
      />
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
