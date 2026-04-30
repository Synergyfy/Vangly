"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './domain.css';

export default function CustomDomainPage() {
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Mock verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setStep(5); // Skip to SSL setup
      
      // Auto-start SSL
      setTimeout(() => {
        setIsSecuring(true);
        setTimeout(() => {
          setIsSecuring(false);
          setStep(6);
        }, 2000);
      }, 500);
    }, 1500);
  };

  return (
    <div className="domain-settings-page">
      <div className="page-header">
        <h1>Custom Domain</h1>
        <p>Connect your own domain to white-label your church's evangelism system.</p>
      </div>

      <div className="onboarding-container">
        {step === 1 && (
          <Card className="onboarding-card glass">
            <h2>Use Your Own Domain</h2>
            <p className="subtitle">Connect your church domain so members see your brand instead of Invitely.</p>
            <form onSubmit={handleContinue}>
              <Input 
                label="Custom Domain" 
                placeholder="e.g. connect.mychurch.com" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <div className="onboarding-actions">
                <Button type="submit" fullWidth disabled={!domain}>Continue</Button>
              </div>
            </form>
          </Card>
        )}

        {step === 3 && (
          <Card className="onboarding-card glass">
            <div className="step-indicator">DNS Setup Required</div>
            <h2>Configure Your DNS</h2>
            <p className="subtitle">To connect your domain, please add the following CNAME record in your domain provider's settings (e.g., GoDaddy, Namecheap).</p>
            
            <div className="dns-table">
              <div className="dns-row header">
                <div>Type</div>
                <div>Name/Host</div>
                <div>Value</div>
              </div>
              <div className="dns-row">
                <div className="badge">CNAME</div>
                <div className="monospace">connect</div>
                <div className="monospace">app.invitely.com</div>
              </div>
            </div>

            <div className="onboarding-actions">
              <Button onClick={handleVerify} fullWidth disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'I have added this'}
              </Button>
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card className="onboarding-card glass text-center">
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
            <h2>{isSecuring ? 'Securing your domain...' : 'Verifying DNS...'}</h2>
            <p className="subtitle">Automatically generating your SSL certificate (Let's Encrypt).</p>
          </Card>
        )}

        {step === 6 && (
          <Card className="onboarding-card glass text-center success-card">
            <div className="success-icon">🎉</div>
            <h2>Your domain is now connected!</h2>
            <p className="subtitle">Everything is set up. Your new white-labeled link is ready.</p>
            
            <div className="domain-link-box">
              <span className="domain-url">https://{domain}</span>
            </div>

            <div className="onboarding-actions">
              <Button variant="primary" fullWidth onClick={() => window.open(`https://${domain}`, '_blank')}>Open My Site</Button>
            </div>
          </Card>
        )}
      </div>

      <Card className="status-panel">
        <div className="status-header">
          <h3>Domain Status</h3>
          <span className={`status-pill ${step === 6 ? 'active' : 'inactive'}`}>
            {step === 6 ? 'Active ✅' : 'Not Connected'}
          </span>
        </div>
        {step === 6 && (
          <div className="status-details">
            <p><strong>Domain:</strong> {domain}</p>
            <div className="status-actions">
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="ghost" size="sm" className="text-danger">Remove</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
