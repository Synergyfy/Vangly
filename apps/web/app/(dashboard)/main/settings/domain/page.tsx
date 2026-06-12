"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import {
  Globe,
  ArrowLeft,
  CheckCircle2,
  Copy,
  RefreshCw,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import {
  useDomainsList,
  useCreateDomain,
  useVerifyDomain,
} from '@/services/domains';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { isValidCustomDomain } from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import { toast } from 'sonner';
import '../settings.css';

function copyToClipboard(value: string, label: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    void navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error('Could not copy'),
    );
  }
}

export default function CustomDomainPage() {
  const router = useRouter();
  const domainsQuery = useDomainsList();
  const createDomain = useCreateDomain();
  const verifyDomain = useVerifyDomain();

  const existingDomain = useMemo(() => domainsQuery.data?.[0] ?? null, [domainsQuery.data]);

  const [step, setStep] = useState<1 | 2 | 3>(existingDomain ? 3 : 1);
  const [domain, setDomain] = useState(existingDomain?.domain ?? '');
  const [createdDomainId, setCreatedDomainId] = useState<string | null>(
    existingDomain?.id ?? null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const { errors, setError, clearAll } = useFieldErrors();
  const isCreating = createDomain.isPending;
  const isVerifying = verifyDomain.isPending;

  useEffect(() => {
    if (existingDomain && existingDomain.status === 'active') {
      setStep(3);
      setDomain(existingDomain.domain);
      setCreatedDomainId(existingDomain.id);
    }
  }, [existingDomain]);

  const handleContinue = async () => {
    clearAll();
    if (!isValidCustomDomain(domain)) {
      setError('domain', 'Use a valid subdomain like connect.myorganization.com.');
      return;
    }
    try {
      const result = await createDomain.mutateAsync({ domain: domain.trim().toLowerCase() });
      setCreatedDomainId(result.id);
      setStep(2);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not start domain setup.'));
    }
  };

  const handleVerify = async () => {
    if (!createdDomainId) {
      toast.error('No domain in progress.');
      return;
    }
    try {
      const result = await verifyDomain.mutateAsync(createdDomainId);
      if (result.status === 'active') {
        setStep(3);
        setShowSuccess(true);
      } else {
        toast.error('Domain is not yet active. Confirm your DNS and try again.');
        setStep(2);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Verification failed.'));
    }
  };

  const verificationToken = existingDomain?.verification_token ?? '';

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/main/settings')}
          className="back-btn-header"
        >
          <ArrowLeft size={18} /> Back to Settings
        </Button>
        <div style={{ marginTop: '16px' }}>
          <h1>White-label Custom Domain</h1>
          <p>Remove Vangly branding and use your organization own domain.</p>
        </div>
      </div>

      <div className="domain-flow-container">
        <div className="domain-progress-steps">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`d-step ${step >= i ? 'active' : ''}`}>
              <div className="d-step-num">
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              <span>{i === 1 ? 'Configure' : i === 2 ? 'DNS Setup' : 'Live'}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="domain-card-content">
            <div className="d-view-header">
              <div className="d-icon-bg"><Globe size={24} /></div>
              <h2>Enter your domain</h2>
              <p>Point your custom domain or subdomain to your organization system.</p>
            </div>

            <div className="d-form-group">
              <Input
                label="Custom Domain"
                placeholder="connect.myorganization.com"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (errors['domain']) clearAll();
                }}
                error={errors['domain']}
                disabled={isCreating}
              />
              <div className="d-info-box">
                <Info size={16} />
                <p>We recommend using a subdomain like <strong>connect.</strong> or <strong>portal.</strong></p>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleContinue}
              disabled={isCreating || !domain}
            >
              {isCreating ? 'Saving...' : 'Continue to DNS Setup'}
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="domain-card-content">
            <div className="d-view-header">
              <h2>Configure DNS Records</h2>
              <p>Log in to your domain provider (GoDaddy, Namecheap, etc.) and add the records below.</p>
            </div>

            <div className="dns-records-list">
              <div className="dns-record-item">
                <div className="dns-col">
                  <label>Type</label>
                  <code>CNAME</code>
                </div>
                <div className="dns-col">
                  <label>Host / Name</label>
                  <div
                    className="copy-field"
                    onClick={() => copyToClipboard(domain.split('.')[0] ?? 'connect', 'Host')}
                    role="button"
                    tabIndex={0}
                  >
                    <code>{domain.split('.')[0] || 'connect'}</code>
                    <Copy size={14} />
                  </div>
                </div>
                <div className="dns-col">
                  <label>Value / Points To</label>
                  <div
                    className="copy-field"
                    onClick={() => copyToClipboard('proxy.vangly.com', 'Value')}
                    role="button"
                    tabIndex={0}
                  >
                    <code>proxy.vangly.com</code>
                    <Copy size={14} />
                  </div>
                </div>
              </div>

              {verificationToken && (
                <div className="dns-record-item">
                  <div className="dns-col">
                    <label>Type</label>
                    <code>TXT</code>
                  </div>
                  <div className="dns-col">
                    <label>Host / Name</label>
                    <div className="copy-field">
                      <code>_vangly</code>
                    </div>
                  </div>
                  <div className="dns-col">
                    <label>Value</label>
                    <div
                      className="copy-field"
                      onClick={() => copyToClipboard(verificationToken, 'Verification token')}
                      role="button"
                      tabIndex={0}
                    >
                      <code>{verificationToken}</code>
                      <Copy size={14} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="d-warning-note">
              <RefreshCw size={16} className="spin-slow" />
              <p>DNS changes can take up to 24-48 hours to propagate worldwide.</p>
            </div>

            <div className="d-actions">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isVerifying}>
                Back
              </Button>
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
            <p>
              <strong>{domain || existingDomain?.domain}</strong> is now the primary access point for your organization network.
            </p>

            <div className="d-results-summary">
              <div className="result-item">
                <ShieldCheck size={16} className="text-success" />
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

            <Button fullWidth size="lg" onClick={() => router.push('/main')}>
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="shield"
        title="Domain Live"
        description={`${domain} is now serving your organization.`}
        primaryAction={{
          label: 'Go to Dashboard',
          navigateTo: '/main',
        }}
        secondaryAction={{ label: 'Done' }}
      />
    </div>
  );
}
