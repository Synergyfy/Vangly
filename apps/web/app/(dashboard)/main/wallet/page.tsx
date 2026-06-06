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
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customCredits, setCustomCredits] = useState<string>('');
  const RATE = 10;

  useEffect(() => {
    const topup = searchParams.get('topup');
    if (topup && !isNaN(Number(topup))) {
      const units = Math.ceil(Number(topup));
      setCustomCredits(units.toString());
      setCustomAmount((units * RATE).toString());
      setShowBuyModal(true);
    }
  }, [searchParams]);

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
                 <h2 className="wb-value">12,450 <span>Credits</span></h2>
              </div>
           </div>
           <Button className="btn-buy-premium" fullWidth onClick={() => setShowBuyModal(true)}>
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
                 <h2 className="wb-value">0 <span>Credits</span></h2>
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
            <Button variant="ghost" size="sm">Download All</Button>
         </div>
         
         <div className="history-list-premium">
            {[1, 2, 3].map(i => (
              <Card key={i} className="history-item-premium">
                 <div className="hi-left">
                    <div className="hi-icon">
                       <ArrowUpRight size={18} />
                    </div>
                    <div className="hi-info">
                       <span className="hi-title">SMS Credit Top-up</span>
                       <span className="hi-meta">Oct {20 + i}, 2026 • 10:45 AM</span>
                    </div>
                 </div>
                 <div className="hi-right">
                    <span className="hi-amount">+500 Credits</span>
                    <span className="hi-status success">Completed</span>
                 </div>
              </Card>
            ))}
         </div>
      </div>

      {showBuyModal && (
        <div className="modal-overlay-premium" onClick={() => setShowBuyModal(false)}>
          <Card className="buy-modal-card-premium" onClick={e => e.stopPropagation()}>
            {success ? (
              <div className="success-state-premium fade-in">
                 <div className="success-icon-wrap">
                    <CheckCircle2 size={48} />
                 </div>
                 <h2>Top-up Successful!</h2>
                 <p>Your {customCredits} credits have been added to your wallet.</p>
              </div>
            ) : (
              <>
                <div className="modal-header-premium">
                   <div>
                      <h3>Top Up Credits</h3>
                      <p>SMS Credits (₦{RATE} per unit)</p>
                   </div>
                   <button className="close-modal-btn" onClick={() => setShowBuyModal(false)}>
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
                      />
                   </div>

                   <div className="form-connector">
                      <ArrowUpRight size={20} />
                   </div>

                   <div className="input-group-premium">
                      <label>Credits to Receive</label>
                      <input 
                        type="number" 
                        value={customCredits}
                        onChange={(e) => handleCreditsChange(e.target.value)}
                        placeholder="e.g. 500"
                      />
                   </div>
                </div>

                <div className="buy-total-strip">
                   <span>Total Payment</span>
                   <strong>₦{Number(customAmount).toLocaleString() || 0}</strong>
                </div>

                <Button 
                  className="btn-premium" 
                  fullWidth 
                  size="lg" 
                  onClick={processPayment}
                  disabled={isProcessing || !customAmount}
                >
                  {isProcessing ? "Processing Payment..." : `Pay ₦${Number(customAmount).toLocaleString() || 0} Now`}
                </Button>

                <div className="secure-footer">
                   <ShieldCheck size={14} /> 
                   <span>Secure Transaction via Paystack</span>
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
