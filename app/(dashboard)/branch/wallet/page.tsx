"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  MessageSquare, 
  Mail, 
  History, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  Zap, 
  Clock, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import './branch-wallet.css';

export default function BranchWalletPage() {
  const router = useRouter();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'sms' | 'email'>('sms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const balances = {
    sms: 1250,
    email: 8400
  };

  const bundles = {
    sms: [
      { id: 's1', name: 'Micro', amount: '500', price: '5,000', popular: false },
      { id: 's2', name: 'Growth', amount: '2,500', price: '22,000', popular: true },
      { id: 's3', name: 'Expansion', amount: '10,000', price: '80,000', popular: false },
    ],
    email: [
      { id: 'e1', name: 'Standard', amount: '2,000', price: '3,500', popular: false },
      { id: 'e2', name: 'Professional', amount: '10,000', price: '15,000', popular: true },
      { id: 'e3', name: 'Enterprise', amount: '50,000', price: '65,000', popular: false },
    ]
  };

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsBuyModalOpen(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Location Credits</div>
            <h1>Manage Wallet</h1>
            <p>Control your location's outreach power and resource allocation.</p>
          </div>
        </div>
        <div className="header-actions">
           <Button variant="outline" size="lg" style={{ borderRadius: '16px' }}>
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
                 <h2 className="wb-value">{balances.sms.toLocaleString()} <span>Units</span></h2>
              </div>
           </div>
           <Button className="btn-buy-premium" fullWidth onClick={() => { setSelectedType('sms'); setIsBuyModalOpen(true); }}>
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
                 <h2 className="wb-value">{balances.email.toLocaleString()} <span>Units</span></h2>
              </div>
           </div>
           <Button className="btn-buy-premium" fullWidth onClick={() => { setSelectedType('email'); setIsBuyModalOpen(true); }}>
              Top Up Email <Plus size={18} style={{ marginLeft: '8px' }} />
           </Button>
        </Card>
      </div>

      <div className="transaction-section-premium">
         <div className="section-header">
            <h2>Recent Activity</h2>
         </div>
         
         <div className="history-list-premium">
            {[1, 2].map(i => (
              <Card key={i} className="history-item-premium">
                 <div className="hi-left">
                    <div className="hi-icon">
                       <ArrowUpRight size={18} />
                    </div>
                    <div className="hi-info">
                       <span className="hi-title">{i === 1 ? 'SMS Growth Bundle' : 'Professional Email Bundle'}</span>
                       <span className="hi-meta">Oct {20 - i}, 2026 • 02:15 PM</span>
                    </div>
                 </div>
                 <div className="hi-right">
                    <span className="hi-amount">₦{i === 1 ? '22,000' : '15,000'}</span>
                    <span className="hi-status success">Completed</span>
                 </div>
              </Card>
            ))}
         </div>
      </div>

      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title={`Purchase ${selectedType.toUpperCase()} Credits`}
      >
        {success ? (
          <div className="success-state-premium fade-in" style={{ padding: '40px 0' }}>
             <div className="success-icon-wrap">
                <CheckCircle2 size={48} />
             </div>
             <h2>Top-up Successful!</h2>
             <p>Your outreach credits have been added to your balance.</p>
          </div>
        ) : (
          <div className="topup-flow-premium">
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px', textAlign: 'center' }}>
              Select a bundle to boost your {selectedType} outreach power.
            </p>
            
            <div className="bundles-stack-premium">
              {bundles[selectedType].map(bundle => (
                <div 
                  key={bundle.id} 
                  className={`bundle-option-card ${bundle.popular ? 'popular' : ''}`}
                  onClick={handlePurchase}
                >
                  {bundle.popular && <div className="pop-badge">Best Value</div>}
                  <div className="bundle-main">
                    <div>
                      <h4>{bundle.name}</h4>
                      <span className="b-units">{bundle.amount} Credits</span>
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
        )}
      </Modal>
    </div>
  );
}
