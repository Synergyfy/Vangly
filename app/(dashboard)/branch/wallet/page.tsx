"use client";

import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import './branch-wallet.css';

export default function BranchWalletPage() {
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
    <div className="branch-wallet-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Manage Credits</h1>
            <p>Control your branch's communication power and billing.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" style={{ gap: '0.5rem' }}>
              <History size={18} />
              Billing History
            </Button>
          </div>
        </div>
      </div>

      <div className="wallet-grid">
        <div className="balance-card sms">
          <div className="balance-icon-bg"><MessageSquare size={120} /></div>
          <div className="balance-header">
            <span className="balance-label">SMS Balance</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="balance-amount">{balances.sms.toLocaleString()}</div>
          <Button 
            fullWidth 
            style={{ background: 'white', color: 'var(--blue)', fontWeight: 700, position: 'relative', zIndex: 10 }}
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              setSelectedType('sms'); 
              setIsBuyModalOpen(true); 
            }}
          >
            Top up SMS
          </Button>
        </div>

        <div className="balance-card email">
          <div className="balance-icon-bg"><Mail size={120} /></div>
          <div className="balance-header">
            <span className="balance-label">Email Balance</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '8px' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className="balance-amount">{balances.email.toLocaleString()}</div>
          <Button 
            fullWidth 
            style={{ background: 'white', color: '#5856D6', fontWeight: 700, position: 'relative', zIndex: 10 }}
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              setSelectedType('email'); 
              setIsBuyModalOpen(true); 
            }}
          >
            Top up Email
          </Button>
        </div>
      </div>

      <div className="usage-stats">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} style={{ color: 'var(--blue)' }} /> Usage Forecast
        </h3>
        <Card className="stats-card">
          <div className="stat-item">
            <span className="stat-label">Daily Burn Rate</span>
            <span className="stat-value">~142 Credits</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Estimated Depletion</span>
            <span className="stat-value">12 Days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Top-up</span>
            <span className="stat-value">Oct 24, 2023</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="stat-label">Auto-Refill</span>
                <span className="stat-value" style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>Disabled</span>
              </div>
              <div style={{ width: '44px', height: '24px', background: 'var(--border)', borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recent Activity</h3>
        <Card style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-secondary)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '1.25rem 1.5rem' }}>Transaction</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Amount</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Date</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--green-light)', color: 'var(--green)', borderRadius: '8px' }}>
                      <Plus size={16} />
                    </div>
                    <span style={{ fontWeight: 600 }}>SMS Growth Bundle</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>₦22,000</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-tertiary)' }}>24 Oct, 2023</td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <span className="user-status-pill volunteer">Completed</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--green-light)', color: 'var(--green)', borderRadius: '8px' }}>
                      <Plus size={16} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Professional Email Bundle</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>₦15,000</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-tertiary)' }}>12 Oct, 2023</td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <span className="user-status-pill volunteer">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title={`Purchase ${selectedType.toUpperCase()} Credits`}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'var(--green-light)', 
              color: 'var(--green)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Top-up Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your credits have been added to your balance instantly.</p>
          </div>
        ) : (
          <div className="composer-section">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Choose a bundle below to boost your {selectedType} outreach power.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bundles[selectedType].map(bundle => (
                <div 
                  key={bundle.id} 
                  className={`bundle-card ${bundle.popular ? 'popular' : ''}`}
                  onClick={handlePurchase}
                >
                  {bundle.popular && <div className="popular-badge">Most Popular</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{bundle.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{bundle.amount} {selectedType.toUpperCase()} Credits</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="bundle-price">₦{bundle.price}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase' }}>Select <ChevronRight size={12} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Secure payments processed via Paystack.</span>
            </div>
            
            {isProcessing && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--blue)', fontWeight: 600 }}>
                Processing secure payment...
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
