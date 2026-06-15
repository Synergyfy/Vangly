"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  MessageSquare,
  Mail,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/services/auth';
import {
  useWalletBalance,
  useWalletTransactions,
  usePurchaseSms,
  useTopupWallet,
} from '@/services/wallet';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { isValidAmount } from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import { usePaystackPayment } from '@/lib/paystack';
import './wallet.css';

const RATE = 10;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function describeTxn(kind: string, description?: string): string {
  if (description && description.trim().length > 0) return description;
  switch (kind) {
    case 'topup':
      return 'Wallet top-up';
    case 'purchase_sms':
      return 'SMS credit top-up';
    case 'send_sms':
      return 'SMS sent';
    case 'refund':
      return 'Refund';
    case 'promo':
      return 'Promo credit';
    default:
      return 'Wallet activity';
  }
}

function WalletContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const balanceQuery = useWalletBalance();
  const transactionsQuery = useWalletTransactions({ page: 1, page_size: 20 });
  const purchaseSms = usePurchaseSms();
  const topupWallet = useTopupWallet();
  const paystack = usePaystackPayment();

  const initialTopup = (() => {
    const raw = searchParams.get('topup');
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.ceil(n) : null;
  })();

  const [showBuyModal, setShowBuyModal] = useState(initialTopup !== null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(
    initialTopup !== null ? (initialTopup * RATE).toString() : '',
  );
  const [customCredits, setCustomCredits] = useState<string>(
    initialTopup !== null ? initialTopup.toString() : '',
  );

  const { errors, setError, clearAll } = useFieldErrors();

  const balance = balanceQuery.data?.balance ?? null;

  const handleAmountChange = (val: string) => {
    setCustomAmount(val);
    if (!isNaN(Number(val)) && val !== '') {
      setCustomCredits((Number(val) / RATE).toFixed(0));
    } else {
      setCustomCredits('');
    }
  };

  const handleCreditsChange = (val: string) => {
    setCustomCredits(val);
    if (!isNaN(Number(val)) && val !== '') {
      setCustomAmount((Number(val) * RATE).toString());
    } else {
      setCustomAmount('');
    }
  };

  const openBuyModal = () => {
    clearAll();
    setShowBuyModal(true);
  };

  const isPaymentProcessing = purchaseSms.isPending || topupWallet.isPending || paystack.isLoading;

  const closeBuyModal = () => {
    if (isPaymentProcessing) return;
    setShowBuyModal(false);
    setCustomAmount('');
    setCustomCredits('');
    clearAll();
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      await topupWallet.mutateAsync({
        amount: Number(customCredits),
        ref_id: reference,
        owner_type: 'user',
        location_id: user!.branch_id!,
        description: `Top-up: ${customCredits} credits via Paystack`,
      });
      await purchaseSms.mutateAsync({
        sms_count: Number(customCredits),
        location_id: user!.branch_id!,
        description: `Top-up: ${customCredits} credits`,
      });
      setShowBuyModal(false);
      setCustomAmount('');
      setCustomCredits('');
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Payment succeeded but credit sync failed. Please refresh.'));
    }
  };

  const handlePurchase = () => {
    clearAll();
    if (!isValidAmount(customCredits, { min: 1, integer: true })) {
      setError('customCredits', 'Enter at least 1 SMS credit.');
      return;
    }
    if (!user?.branch_id) {
      toast.error('No branch is associated with your account yet.');
      return;
    }

    const email = `${user.name.toLowerCase().replace(/\s+/g, '.')}@harvite.app`;
    paystack.initializePayment({
      email,
      amount: Number(customAmount) * 100,
      onSuccess: (response) => handlePaystackSuccess(response.reference),
      onClose: () => toast.info('Payment cancelled.'),
    });
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Financial Ops</div>
          <h1>Wallet & Credits</h1>
          <p>Manage your outreach resources and billing history.</p>
        </div>
      </header>

      <div className="wallet-modern-grid">
        <Card className="wallet-balance-card-premium sms">
          <div className="wb-content">
            <div className="wb-icon-box">
              <MessageSquare size={24} />
            </div>
            <div className="wb-info">
              <span className="wb-label">SMS Balance</span>
              <h2 className="wb-value">
                {balance === null ? '—' : balance.toLocaleString()} <span>Credits</span>
              </h2>
            </div>
          </div>
          <Button
            className="btn-buy-premium"
            fullWidth
            onClick={openBuyModal}
            disabled={balanceQuery.isLoading}
          >
            Top Up SMS <Plus size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </Card>

        <Card className="wallet-balance-card-premium email locked">
          <div className="wb-content">
            <div className="wb-icon-box">
              <Mail size={24} />
            </div>
            <div className="wb-info">
              <span className="wb-label">Email Balance</span>
              <h2 className="wb-value">
                0 <span>Credits</span>
              </h2>
              <span className="locked-tag">Coming Soon</span>
            </div>
          </div>
          <Button className="btn-buy-premium" fullWidth disabled>
            Locked
          </Button>
        </Card>
      </div>

      <div className="transaction-section-premium">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Button variant="ghost" size="sm" disabled>
            Download All
          </Button>
        </div>

        <div className="history-list-premium">
          {balanceQuery.isLoading || transactionsQuery.isLoading ? (
            <Card className="history-item-premium">
              <div className="hi-info">
                <span className="hi-title">Loading transactions…</span>
              </div>
            </Card>
          ) : transactionsQuery.isError ? (
            <Card className="history-item-premium">
              <div className="hi-info">
                <span className="hi-title">Could not load transactions.</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => transactionsQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            </Card>
          ) : (transactionsQuery.data?.data ?? []).length === 0 ? (
            <Card className="history-item-premium">
              <div className="hi-info">
                <span className="hi-title">No activity yet.</span>
                <span className="hi-meta">Your top-ups will appear here.</span>
              </div>
            </Card>
          ) : (
            (transactionsQuery.data?.data ?? []).map((txn) => (
              <Card key={txn.id} className="history-item-premium">
                <div className="hi-left">
                  <div className="hi-icon">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="hi-info">
                    <span className="hi-title">{describeTxn(txn.kind, txn.description)}</span>
                    <span className="hi-meta">{formatDate(txn.created_at)}</span>
                  </div>
                </div>
                <div className="hi-right">
                  <span className="hi-amount">
                    {txn.delta > 0 ? '+' : ''}
                    {txn.delta.toLocaleString()} Credits
                  </span>
                  <span className="hi-status success">Completed</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {showBuyModal && (
        <div
          className="modal-overlay-premium"
          onClick={closeBuyModal}
        >
          <Card
            className="buy-modal-card-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-premium">
              <div>
                <h3>Top Up Credits</h3>
                <p>SMS Credits (₦{RATE} per unit)</p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeBuyModal}
                disabled={isPaymentProcessing}
              >
                <X size={20} />
              </button>
            </div>

            <div className="topup-form-premium">
              <div className="input-group-premium">
                <label>Amount to Pay (₦)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="e.g. 5000"
                  disabled={isPaymentProcessing}
                />
              </div>

              <div className="form-connector">
                <ArrowUpRight size={20} />
              </div>

              <Input
                label="Credits to Receive"
                type="number"
                value={customCredits}
                onChange={(e) => handleCreditsChange(e.target.value)}
                placeholder="e.g. 500"
                error={errors['customCredits']}
                disabled={isPaymentProcessing}
              />
            </div>

            <div className="buy-total-strip">
              <span>Total Payment</span>
              <strong>
                ₦
                {Number(customAmount).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </strong>
            </div>

            <Button
              className="btn-premium"
              fullWidth
              size="lg"
              onClick={handlePurchase}
              disabled={isPaymentProcessing || !customAmount}
            >
              {paystack.isLoading
                ? 'Opening Paystack...'
                : topupWallet.isPending
                ? 'Crediting Wallet...'
                : purchaseSms.isPending
                ? 'Purchasing Credits...'
                : `Pay ₦${
                    Number(customAmount).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) || 0
                  } Now`}
            </Button>

            <div className="secure-footer">
              <ShieldCheck size={14} />
              <span>Secure Transaction via Paystack</span>
            </div>
          </Card>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="wallet"
        title="Top-up Successful!"
        description={`${customCredits || '0'} credits have been added to your wallet.`}
        primaryAction={{
          label: 'Send a Message',
          navigateTo: '/main/messages/messages',
        }}
        secondaryAction={{ label: 'Done' }}
      />
    </div>
  );
}

import { Suspense } from 'react';

export default function WalletPage() {
  return (
    <Suspense fallback={<div>Loading Wallet...</div>}>
      <WalletContent />
    </Suspense>
  );
}
