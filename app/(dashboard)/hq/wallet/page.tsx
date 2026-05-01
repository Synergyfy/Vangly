"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

export default function WalletPage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyType, setBuyType] = useState<'sms' | 'email'>('sms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock balance
  const balances = {
    sms: 1250,
    email: 8400
  };

  const handleBuy = (type: 'sms' | 'email') => {
    setBuyType(type);
    setShowBuyModal(true);
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowBuyModal(false);
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
            Buy SMS Credits <Plus size={16} />
          </Button>
        </Card>

        <Card className="balance-card email-theme">
          <div className="balance-icon"><Mail size={24} /></div>
          <div className="balance-info">
            <h3>Email Credits</h3>
            <p className="balance-value">{balances.email.toLocaleString()}</p>
            <span className="balance-subtitle">Available for newsletters</span>
          </div>
          <Button fullWidth onClick={() => handleBuy('email')} className="btn-buy">
            Buy Email Credits <Plus size={16} />
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
            <div className="history-row" data-type="Type">
              <span className="type-col"><Plus size={14} className="text-success" /> Email Top-up</span>
              <span className="amount-col">2,000 Credits</span>
              <span className="date-col">Oct 12, 2023</span>
              <span className="status-col status-badge success">Completed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Buy Credits Modal */}
      {showBuyModal && (
        <div className="modal-overlay">
          <Card className="buy-credits-modal">
            {success ? (
              <div className="payment-success-view">
                <CheckCircle2 size={64} className="text-success" />
                <h2>Payment Successful!</h2>
                <p>Your {buyType.toUpperCase()} credits have been added instantly.</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h3>Buy {buyType === 'sms' ? 'SMS' : 'Email'} Credits</h3>
                  <button className="close-btn" onClick={() => setShowBuyModal(false)}><X size={20} /></button>
                </div>
                
                <div className="buy-options-grid">
                  <div className="buy-option">
                    <span className="option-label">Starter</span>
                    <span className="option-amount">500 {buyType === 'sms' ? 'SMS' : 'Emails'}</span>
                    <span className="option-price">₦5,000</span>
                    <Button fullWidth size="sm" variant="outline" onClick={processPayment} disabled={isProcessing}>Select</Button>
                  </div>
                  <div className="buy-option featured">
                    <span className="option-label">Most Popular</span>
                    <span className="option-amount">2,000 {buyType === 'sms' ? 'SMS' : 'Emails'}</span>
                    <span className="option-price">₦18,000</span>
                    <Button fullWidth size="sm" onClick={processPayment} disabled={isProcessing}>Select</Button>
                  </div>
                  <div className="buy-option">
                    <span className="option-label">Church-Wide</span>
                    <span className="option-amount">10,000 {buyType === 'sms' ? 'SMS' : 'Emails'}</span>
                    <span className="option-price">₦75,000</span>
                    <Button fullWidth size="sm" variant="outline" onClick={processPayment} disabled={isProcessing}>Select</Button>
                  </div>
                </div>

                <div className="payment-footer">
                  <div className="secure-badge">
                    <ShieldCheck size={14} /> Secure Payment via Payment Gateway
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
