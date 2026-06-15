"use client";

import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/services/auth';
import {
  useWalletBalance,
  usePurchaseSms,
  useTopupWallet,
} from '@/services/wallet';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { isValidAmount } from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import { usePaystackPayment } from '@/lib/paystack';
import '../worker.css';

const RATE_PER_UNIT = 4;

export default function TopUpPage() {
  const router = useRouter();
  const { user } = useAuth();
  const balanceQuery = useWalletBalance();
  const purchaseSms = usePurchaseSms();
  const topupWallet = useTopupWallet();
  const paystack = usePaystackPayment();

  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const { errors, setError, clearAll } = useFieldErrors();

  const calculatedCredits = amount && !isNaN(Number(amount))
    ? Math.floor(Number(amount) / RATE_PER_UNIT)
    : 0;
  const isProcessing = purchaseSms.isPending || topupWallet.isPending || paystack.isLoading;

  const goToPayment = () => {
    clearAll();
    if (!isValidAmount(amount, { min: 100 })) {
      setError('amount', 'Minimum purchase is ₦100.');
      return;
    }
    if (calculatedCredits < 1) {
      setError('amount', 'Increase the amount to receive at least 1 credit.');
      return;
    }
    setStep('payment');
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      await topupWallet.mutateAsync({
        amount: calculatedCredits,
        ref_id: reference,
        owner_type: 'user',
        location_id: user!.branch_id!,
        description: `Worker top-up: ${calculatedCredits} credits`,
      });
      await purchaseSms.mutateAsync({
        sms_count: calculatedCredits,
        location_id: user!.branch_id!,
        description: `Worker top-up: ${calculatedCredits} credits`,
      });
      const refetchResult = await balanceQuery.refetch();
      setNewBalance(refetchResult.data?.balance ?? calculatedCredits);
      setStep('plans');
      setAmount('');
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Top-up completed but credit sync failed. Please refresh.'));
    }
  };

  const handlePurchase = () => {
    if (!user?.branch_id) {
      toast.error('No branch is associated with your account yet.');
      return;
    }
    const email = `${user.name.toLowerCase().replace(/\s+/g, '.')}@harvite.app`;
    paystack.initializePayment({
      email,
      amount: Number(amount) * 100,
      onSuccess: (response) => handlePaystackSuccess(response.reference),
      onClose: () => toast.info('Payment cancelled.'),
    });
  };

  const currentBalance =
    balanceQuery.data?.balance ?? user?.credits ?? 0;

  return (
    <div className="worker-dashboard">
      <header
        className="dashboard-header"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1>SMS Top Up</h1>
          <p>Purchase credits to keep your outreach flowing.</p>
        </div>
      </header>

      {step === 'plans' && (
        <div className="top-up-container fade-in">
          <div className="current-balance-card">
            <div className="balance-info">
              <span className="label">Available Balance</span>
              <div className="value-row">
                <Wallet size={24} className="text-orange" />
                <span className="value">
                  {balanceQuery.isLoading ? '—' : currentBalance.toLocaleString()}
                </span>
                <span className="unit">Credits</span>
              </div>
            </div>
            <div className="admin-status">
              <ShieldCheck size={16} />
              <span>Admin Top-up enabled</span>
            </div>
          </div>

          <Card className="custom-amount-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Enter Amount to Buy
            </h2>

            <div className="amount-input-wrapper">
              <span className="currency-symbol">₦</span>
              <input
                type="number"
                placeholder="0.00"
                className="custom-amount-input"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors['amount']) clearAll();
                }}
                min="100"
                disabled={isProcessing}
              />
            </div>
            {errors['amount'] && (
              <p className="input-error-text" style={{ marginTop: '8px' }}>
                {errors['amount']}
              </p>
            )}
            <p className="min-amount-text">Minimum purchase: ₦100</p>

            <div className="calculation-box">
              <div className="calc-row">
                <span>Rate per unit:</span>
                <strong>₦{RATE_PER_UNIT}.00</strong>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-row result">
                <span>You will receive:</span>
                <div className="credits-result">
                  <Zap size={18} className="text-orange" />
                  <strong>{calculatedCredits.toLocaleString()} Credits</strong>
                </div>
              </div>
            </div>
          </Card>

          <div className="top-up-footer">
            <Button
              fullWidth
              size="lg"
              disabled={!amount || Number(amount) < 100 || isProcessing}
              onClick={goToPayment}
            >
              Continue to Payment
            </Button>
            <p className="secure-text">
              <ShieldCheck size={14} /> Secure encrypted transaction via Paystack
            </p>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="payment-container fade-in">
          <Card className="payment-card">
            <h2>Payment Details</h2>
            <div className="order-summary">
              <div className="summary-row">
                <span>Amount to Top Up:</span>
                <strong>₦{Number(amount).toLocaleString()}.00</strong>
              </div>
              <div className="summary-row">
                <span>Credits to Add:</span>
                <strong>{calculatedCredits.toLocaleString()} Credits</strong>
              </div>
              <div className="summary-row total">
                <span>Total Due:</span>
                <strong>₦{Number(amount).toLocaleString()}.00</strong>
              </div>
            </div>

            <div className="paystack-payment-info">
              <div className="payment-icon-box">
                <CreditCard size={32} className="text-purple" />
              </div>
              <p className="payment-info-text">
                You will be redirected to Paystack's secure checkout to complete
                your payment of <strong>₦{Number(amount).toLocaleString()}.00</strong>.
              </p>
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={isProcessing}
              onClick={handlePurchase}
            >
              {paystack.isLoading
                ? 'Opening Paystack...'
                : topupWallet.isPending
                ? 'Crediting Wallet...'
                : purchaseSms.isPending
                ? 'Purchasing Credits...'
                : `Pay ₦${Number(amount).toLocaleString()}.00`}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setStep('plans')}
              disabled={isProcessing}
            >
              Back
            </Button>
          </Card>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="wallet"
        title="Credits Added!"
        description={
          newBalance !== null
            ? `Your new balance is ${newBalance.toLocaleString()} credits.`
            : 'Your wallet has been recharged successfully.'
        }
        primaryAction={{
          label: 'Back to Dashboard',
          navigateTo: '/worker',
        }}
        secondaryAction={{
          label: 'Send a Message',
          navigateTo: '/worker/messages',
        }}
      />
    </div>
  );
}
