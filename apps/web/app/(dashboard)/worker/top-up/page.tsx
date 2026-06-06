"use client";

import React, { useState } from 'react';
import {
  Wallet,
  ChevronRight,
  Check,
  CreditCard,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/services/auth';
import { authKeys } from '@/lib/api/queries/auth.keys';
import '../worker.css';

export default function TopUpPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');

  const RATE_PER_UNIT = 4; // 1 Unit = 4 Naira
  const calculatedCredits = amount ? Math.floor(Number(amount) / RATE_PER_UNIT) : 0;

  const handlePurchase = () => {
    if (!amount || Number(amount) < 100) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (user) {
        // Update cached user credits; the real backend will return the
        // authoritative balance on the next /me fetch.
        qc.setQueryData(authKeys.me(), {
          ...user,
          credits: user.credits + calculatedCredits,
        });
      }
      setIsProcessing(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="worker-dashboard">
      <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <span className="value">{user?.credits || 0}</span>
                <span className="unit">Credits</span>
              </div>
            </div>
            <div className="admin-status">
              <ShieldCheck size={16} />
              <span>Admin Top-up enabled</span>
            </div>
          </div>

          <Card className="custom-amount-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Enter Amount to Buy</h2>
            
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₦</span>
              <input 
                type="number" 
                placeholder="0.00" 
                className="custom-amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
              />
            </div>
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
              disabled={!amount || Number(amount) < 100}
              onClick={() => setStep('payment')}
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

            <div className="mock-card-input">
              <div className="card-input-row">
                <CreditCard size={20} className="text-tertiary" />
                <input type="text" placeholder="Card Number" defaultValue="4242 4242 4242 4242" readOnly />
              </div>
              <div className="card-input-row-group">
                <input type="text" placeholder="MM/YY" defaultValue="12/26" readOnly />
                <input type="text" placeholder="CVC" defaultValue="123" readOnly />
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              disabled={isProcessing}
              onClick={handlePurchase}
            >
              {isProcessing ? 'Processing...' : `Pay ₦${Number(amount).toLocaleString()}.00`}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep('plans')}>Back</Button>
          </Card>
        </div>
      )}

      {step === 'success' && (
        <div className="success-container fade-in">
          <div className="success-lottie">
            <Sparkles size={80} className="text-orange" />
          </div>
          <h2>Credits Added!</h2>
          <p>Your wallet has been recharged successfully. You can now continue sending messages.</p>
          
          <Card className="new-balance-card">
            <span>New Balance</span>
            <div className="new-value">{user?.credits} Credits</div>
          </Card>

          <Button fullWidth size="lg" onClick={() => router.push('/worker')}>Back to Dashboard</Button>
        </div>
      )}
    </div>
  );
}
