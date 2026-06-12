"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MessageSquare,
  Mail,
  History,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/services/auth';
import {
  useWalletBalance,
  useWalletTransactions,
  usePurchaseSms,
} from '@/services/wallet';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import './branch-wallet.css';

interface Bundle {
  id: string;
  name: string;
  amount: number;
  price: string;
  popular: boolean;
}

const BUNDLES: Record<'sms' | 'email', Bundle[]> = {
  sms: [
    { id: 's1', name: 'Micro', amount: 500, price: '5,000', popular: false },
    { id: 's2', name: 'Growth', amount: 2500, price: '22,000', popular: true },
    { id: 's3', name: 'Expansion', amount: 10000, price: '80,000', popular: false },
  ],
  email: [
    { id: 'e1', name: 'Standard', amount: 2000, price: '3,500', popular: false },
    { id: 'e2', name: 'Professional', amount: 10000, price: '15,000', popular: true },
    { id: 'e3', name: 'Enterprise', amount: 50000, price: '65,000', popular: false },
  ],
};

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

function describeTxn(description?: string, kind?: string): string {
  if (description && description.trim().length > 0) return description;
  switch (kind) {
    case 'purchase_sms':
      return 'SMS credit top-up';
    case 'topup':
      return 'Wallet top-up';
    case 'send_sms':
      return 'SMS sent';
    case 'refund':
      return 'Refund';
    default:
      return 'Wallet activity';
  }
}

export default function BranchWalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const balanceQuery = useWalletBalance();
  const transactionsQuery = useWalletTransactions({ page: 1, page_size: 20 });
  const purchaseSms = usePurchaseSms();

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'sms' | 'email'>('sms');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successBundleName, setSuccessBundleName] = useState('');

  const balance = balanceQuery.data?.balance ?? null;
  const isProcessing = purchaseSms.isPending;

  const openBuyModal = (type: 'sms' | 'email') => {
    setSelectedType(type);
    setIsBuyModalOpen(true);
  };

  const closeBuyModal = () => {
    if (isProcessing) return;
    setIsBuyModalOpen(false);
  };

  const handlePurchase = async (bundle: Bundle) => {
    if (selectedType === 'email') {
      toast.info('Email credits are coming soon.');
      return;
    }
    if (!user?.branch_id) {
      toast.error('No branch is associated with your account yet.');
      return;
    }

    try {
      await purchaseSms.mutateAsync({
        sms_count: bundle.amount,
        location_id: user.branch_id,
        description: `${bundle.name} SMS bundle`,
      });
      setSuccessBundleName(bundle.name);
      setIsBuyModalOpen(false);
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not complete your top-up.'));
    }
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="back-btn-pill"
            style={{ marginBottom: '12px' }}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div>
            <div className="admin-badge-premium">Wallet & Credits</div>
            <h1>Manage Wallet</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>
              Control your location outreach power and resource allocation.
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant="outline"
            size="lg"
            style={{ borderRadius: '16px' }}
            disabled
          >
            <History size={18} style={{ marginRight: '8px' }} /> History
          </Button>
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
                {balance === null ? '—' : balance.toLocaleString()} <span>Units</span>
              </h2>
            </div>
          </div>
          <Button
            className="btn-buy-premium"
            fullWidth
            onClick={() => openBuyModal('sms')}
            disabled={balanceQuery.isLoading}
          >
            Top Up SMS <Plus size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </Card>

        <Card className="wallet-balance-card-premium email">
          <div className="wb-content">
            <div className="wb-icon-box">
              <Mail size={24} />
            </div>
            <div className="wb-info">
              <span className="wb-label">Email Balance</span>
              <h2 className="wb-value">
                0 <span>Units</span>
              </h2>
            </div>
          </div>
          <Button
            className="btn-buy-premium"
            fullWidth
            onClick={() => openBuyModal('email')}
          >
            Top Up Email <Plus size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </Card>
      </div>

      <div className="transaction-section-premium">
        <div className="section-header">
          <h2>Recent Activity</h2>
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
                    <span className="hi-title">{describeTxn(txn.description, txn.kind)}</span>
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

      <Modal
        isOpen={isBuyModalOpen}
        onClose={closeBuyModal}
        title={`Purchase ${selectedType.toUpperCase()} Credits`}
      >
        <div className="topup-flow-premium">
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            Select a bundle to boost your {selectedType} outreach power.
          </p>

          <div className="bundles-stack-premium">
            {BUNDLES[selectedType].map((bundle) => (
              <div
                key={bundle.id}
                className={`bundle-option-card ${bundle.popular ? 'popular' : ''} ${
                  isProcessing ? 'disabled' : ''
                }`}
                onClick={() => !isProcessing && handlePurchase(bundle)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
                    e.preventDefault();
                    handlePurchase(bundle);
                  }
                }}
              >
                {bundle.popular && <div className="pop-badge">Best Value</div>}
                <div className="bundle-main">
                  <div>
                    <h4>{bundle.name}</h4>
                    <span className="b-units">
                      {bundle.amount.toLocaleString()} Credits
                    </span>
                  </div>
                  <div className="bundle-price-tag">
                    <span className="p-curr">₦</span>
                    <span className="p-val">{bundle.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-secure-footer">
            <ShieldCheck size={14} />
            <span>Secure Checkout via Paystack</span>
          </div>

          {isProcessing && (
            <div className="payment-processing-overlay">
              <div className="spinner-premium" />
              <span>Processing Secure Payment...</span>
            </div>
          )}
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="wallet"
        title="Top-up Successful!"
        description={`The ${successBundleName} bundle credits have been added to your location wallet.`}
        primaryAction={{
          label: 'Send a Message',
          navigateTo: '/branch/messages/messages',
        }}
        secondaryAction={{ label: 'View History' }}
      />
    </div>
  );
}
