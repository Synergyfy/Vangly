"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Globe, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import '../settings.css';

export default function CustomDomainPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hq/settings')} className="back-btn-header">
          <ArrowLeft size={18} /> Back to Settings
        </Button>
        <div style={{ marginTop: '16px' }}>
          <h1>White-label Custom Domain</h1>
          <p>Remove Vangly branding and use your church's own domain.</p>
        </div>
      </div>

      <div className="domain-flow-container">
        {/* Progress Bar */}
        <div className="domain-progress-steps">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`d-step ${step >= i ? 'active' : ''}`}>
              <div className="d-step-num">{step > i ? <CheckCircle2 size={16} /> : i}</div>
              <span>{i === 1 ? 'Configure' : i === 2 ? 'DNS Setup' : 'Live'}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="domain-card-content">
            <div className="d-view-header">
              <div className="d-icon-bg"><Globe size={24} /></div>
              <h2>Enter your domain</h2>
              <p>Point your custom domain or subdomain to your church system.</p>
            </div>
            
            <div className="d-form-group">
              <Input 
                label="Custom Domain" 
                placeholder="connect.mychurch.com" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <div className="d-info-box">
                <Info size={16} />
                <p>We recommend using a subdomain like <strong>connect.</strong> or <strong>portal.</strong></p>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => setStep(2)} disabled={!domain}>
              Continue to DNS Setup
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="domain-card-content">
            <div className="d-view-header">
              <h2>Configure DNS Records</h2>
              <p>Log in to your domain provider (GoDaddy, Namecheap, etc.) and add this CNAME record.</p>
            </div>

            <div className="dns-records-list">
              <div className="dns-record-item">
                <div className="dns-col">
                  <label>Type</label>
                  <code>CNAME</code>
                </div>
                <div className="dns-col">
                  <label>Host / Name</label>
                  <div className="copy-field">
                    <code>{domain.split('.')[0] || 'connect'}</code>
                    <Copy size={14} />
                  </div>
                </div>
                <div className="dns-col">
                  <label>Value / Points To</label>
                  <div className="copy-field">
                    <code>proxy.vangly.com</code>
                    <Copy size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-warning-note">
              <RefreshCw size={16} className="spin-slow" />
              <p>DNS changes can take up to 24-48 hours to propagate worldwide.</p>
            </div>

            <div className="d-actions">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? 'Verifying Connection...' : 'Verify DNS Connection'}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="domain-card-content success-domain-card">
            <div className="d-success-visual">
              <Zap size={48} className="text-primary" />
            </div>
            <h2>Your domain is now live!</h2>
            <p><strong>{domain}</strong> is now the primary access point for your church network.</p>
            
            <div className="d-results-summary">
              <div className="result-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>SSL Certificate Active</span>
              </div>
              <div className="result-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>White-labeling Enabled</span>
              </div>
              <div className="result-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>QR Codes Updated</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => router.push('/hq')}>Go to Dashboard</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
