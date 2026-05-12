"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { 
  Wallet, 
  MessageSquare, 
  Mail, 
  History, 
  ArrowUpRight, 
  Plus,
  ShieldCheck,
  CreditCard,
  X,
  CheckCircle2
} from 'lucide-react';
import './wallet.css';

function WalletContent() {
  const searchParams = useSearchParams();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyType, setBuyType] = useState<'sms' | 'email'>('sms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Custom purchase state
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customCredits, setCustomCredits] = useState<string>('');
  const RATE = 10; // ₦10 per SMS credit

  useEffect(() => {
    const topup = searchParams.get('topup');
    if (topup && !isNaN(Number(topup))) {
      const units = Math.ceil(Number(topup));
      setCustomCredits(units.toString());
      setCustomAmount((units * RATE).toString());
      setBuyType('sms');
      setShowBuyModal(true);
    }
  }, [searchParams]);

  const handleAmountChange = (val: string) => {
    setCustomAmount(val);
    if (!isNaN(Number(val))) {
      setCustomCredits((Number(val) / RATE).toFixed(0));
    } else {
      setCustomCredits('');
    }
  };

  const handleCreditsChange = (val: string) => {
    setCustomCredits(val);
    if (!isNaN(Number(val))) {
      setCustomAmount((Number(val) * RATE).toString());
    } else {
      setCustomAmount('');
    }
  };

  // Mock balance
  const balances = {
    sms: 1250,
    email: 0
  };

  const handleBuy = (type: 'sms' | 'email') => {
    if (type === 'email') return; // Locked
    setBuyType(type);
    setShowBuyModal(true);
  };

  const processPayment = () => {
    if (!customAmount || Number(customAmount) <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowBuyModal(false);
        setCustomAmount('');
        setCustomCredits('');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div>
          <h1>Wallet & Credits</h1>
          <p>Manage your communication resources for outreach.</p>
        </div>
        <div className="wallet-balance-total">
          <Wallet size={18} />
          <span>Active Resources</span>
        </div>
      </div>

      <div className="wallet-grid">
        <Card className="balance-card sms-theme">
          <div className="balance-icon"><MessageSquare size={24} /></div>
          <div className="balance-info">
            <h3>SMS Credits</h3>
            <p className="balance-value">{balances.sms.toLocaleString()}</p>
            <span className="balance-subtitle">Available for campaigns</span>
          </div>
          <Button fullWidth onClick={() => handleBuy('sms')} className="btn-buy">
            Top Up SMS <Plus size={16} />
          </Button>
        </Card>

        <Card className="balance-card email-theme" style={{ opacity: 0.7, position: 'relative' }}>
          <div className="coming-soon-badge">Coming Soon</div>
          <div className="balance-icon"><Mail size={24} /></div>
          <div className="balance-info">
            <h3>Email Credits</h3>
            <p className="balance-value">0</p>
            <span className="balance-subtitle">Email outreach is locked</span>
          </div>
          <Button fullWidth disabled className="btn-buy">
            Locked
          </Button>
        </Card>
      </div>

      <div className="transaction-history">
        <div className="section-header">
          <h2><History size={18} /> Recent Top-ups</h2>
        </div>
        <Card className="history-card">
          <div className="history-table">
            <div className="history-row header">
              <span>Type</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            <div className="history-row" data-type="Type">
              <span className="type-col"><Plus size={14} className="text-success" /> SMS Top-up</span>
              <span className="amount-col">500 Credits</span>
              <span className="date-col">Oct 24, 2023</span>
              <span className="status-col status-badge success">Completed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Buy Credits Modal */}
      {showBuyModal && (
        <div className="modal-overlay">
          <Card className="buy-credits-modal-v2">
            {success ? (
              <div className="payment-success-view">
                <CheckCircle2 size={64} className="text-success" />
                <h2>Payment Successful!</h2>
                <p>Your {customCredits} SMS credits have been added instantly.</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div className="modal-title-group">
                    <h3>Top Up SMS Credits</h3>
                    <p>Enter the amount you want to buy</p>
                  </div>
                  <button className="close-btn" onClick={() => setShowBuyModal(false)}><X size={20} /></button>
                </div>
                
                <div className="custom-buy-form">
                  <div className="input-group-premium">
                    <label>Amount (₦)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      value={customAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="conversion-icon">
                    <ArrowUpRight size={20} />
                  </div>

                  <div className="input-group-premium">
                    <label>SMS Credits</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={customCredits}
                      onChange={(e) => handleCreditsChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="buy-summary">
                   <div className="summary-row">
                      <span>Rate</span>
                      <span>₦{RATE} / SMS</span>
                   </div>
                   <div className="summary-row total">
                      <span>Total to Pay</span>
                      <span>₦{Number(customAmount).toLocaleString() || 0}</span>
                   </div>
                </div>

                <Button 
                  fullWidth 
                  size="lg" 
                  className="btn-premium" 
                  onClick={processPayment} 
                  disabled={isProcessing || !customAmount}
                >
                  {isProcessing ? 'Processing...' : `Pay ₦${Number(customAmount).toLocaleString() || 0} Now`}
                </Button>

                <div className="payment-footer">
                  <div className="secure-badge">
                    <ShieldCheck size={14} /> Secure Payment Gateway
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
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
