"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import {
  Copy,
  Globe,
  Loader2,
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
import './domain.css';

function copyToClipboard(value: string, label: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    void navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error('Could not copy'),
    );
  }
}

export default function CustomDomainPage() {
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

  const handleContinue = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
    <div className="domain-settings-page">
      <div className="page-header">
        <h1>Custom Domain</h1>
        <p>Connect your own domain to white-label your organization evangelism system.</p>
      </div>

      <div className="onboarding-container">
        {step === 1 && (
          <Card className="onboarding-card glass">
            <h2>Use Your Own Domain</h2>
            <p className="subtitle">Connect your organization domain so members see your brand instead of Harvite.</p>
            <form onSubmit={handleContinue}>
              <Input
                label="Custom Domain"
                placeholder="e.g. connect.myorganization.com"
                value={domain}
                onChange={(ev) => {
                  setDomain(ev.target.value);
                  if (errors['domain']) clearAll();
                }}
                error={errors['domain']}
                disabled={isCreating}
              />
              <div className="onboarding-actions">
                <Button type="submit" fullWidth disabled={isCreating || !domain}>
                  {isCreating ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="onboarding-card glass">
            <div className="step-indicator">DNS Setup Required</div>
            <h2>Configure Your DNS</h2>
            <p className="subtitle">
              Add the following records at your domain provider (e.g. GoDaddy, Namecheap).
            </p>

            <div className="dns-table">
              <div className="dns-row header">
                <div>Type</div>
                <div>Name/Host</div>
                <div>Value</div>
              </div>
              <div className="dns-row">
                <div className="badge">CNAME</div>
                <div
                  className="monospace"
                  onClick={() => copyToClipboard(domain.split('.')[0] ?? 'connect', 'Host')}
                  role="button"
                  tabIndex={0}
                >
                  {domain.split('.')[0] || 'connect'} <Copy size={12} />
                </div>
                <div
                  className="monospace"
                  onClick={() => copyToClipboard('app.harvite.com', 'Value')}
                  role="button"
                  tabIndex={0}
                >
                  app.harvite.com <Copy size={12} />
                </div>
              </div>
              {verificationToken && (
                <div className="dns-row">
                  <div className="badge">TXT</div>
                  <div className="monospace">_harvite</div>
                  <div
                    className="monospace"
                    onClick={() => copyToClipboard(verificationToken, 'Verification token')}
                    role="button"
                    tabIndex={0}
                  >
                    {verificationToken} <Copy size={12} />
                  </div>
                </div>
              )}
            </div>

            <div className="onboarding-actions">
              <Button
                onClick={handleVerify}
                fullWidth
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={18} className="spin-slow" style={{ marginRight: '8px' }} />
                    Verifying...
                  </>
                ) : (
                  'I have added this'
                )}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="onboarding-card glass text-center success-card">
            <div className="success-icon">
              <Globe size={36} />
            </div>
            <h2>Your domain is now connected!</h2>
            <p className="subtitle">Everything is set up. Your new white-labeled link is ready.</p>

            <div className="domain-link-box">
              <span className="domain-url">https://{domain || existingDomain?.domain}</span>
            </div>

            <div className="onboarding-actions">
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.open(`https://${domain || existingDomain?.domain}`, '_blank')}
              >
                Open My Site
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Card className="status-panel">
        <div className="status-header">
          <h3>Domain Status</h3>
          <span className={`status-pill ${step === 3 ? 'active' : 'inactive'}`}>
            {step === 3 ? 'Active' : 'Not Connected'}
          </span>
        </div>
        {step === 3 && (
          <div className="status-details">
            <p><strong>Domain:</strong> {domain || existingDomain?.domain}</p>
            <div className="status-actions">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Change
              </Button>
            </div>
          </div>
        )}
      </Card>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="shield"
        title="Domain Connected"
        description={`${domain} is now serving your organization.`}
        primaryAction={{ label: 'Okay' }}
      />
    </div>
  );
}
