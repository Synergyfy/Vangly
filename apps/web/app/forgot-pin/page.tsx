"use client";

import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPin, useResetPin } from '@/services/auth';
import { ApiError } from '@/lib/api/client';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { mapApiErrorToField } from '@/lib/forms/map-api-error-to-field';
import { isE164, isValidPin } from '@/lib/forms/validators';
import { ArrowLeft, Lock, Phone, ShieldCheck } from 'lucide-react';
import '../login/login.css';

function bannerFromError(err: unknown): string {
  if (err instanceof ApiError) return err.body.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function ForgotPinPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { errors, setError, clearAll, bindField } = useFieldErrors();

  const forgotMut = useForgotPin();
  const resetMut = useResetPin();
  const router = useRouter();

  const handlePhoneChange = bindField('phone', setPhone);
  const handlePinChange = bindField('pin', setPin);
  const handleConfirmChange = bindField('confirmPin', setConfirmPin);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (forgotMut.isPending) return;

    clearAll();
    setBanner(null);
    setSuccess(null);

    if (!phone) {
      setError('phone', 'Phone number is required.');
      return;
    }
    if (!isE164(phone)) {
      setError('phone', 'Enter a valid phone number, e.g. +2348012345678.');
      return;
    }

    try {
      const result = await forgotMut.mutateAsync({ phone });
      setOnboardingToken(result.onboarding_token);
      setStep(2);
    } catch (err) {
      const field = mapApiErrorToField(err, ['phone']);
      if (field) {
        setError(field, err instanceof ApiError ? err.body.message : 'Invalid phone.');
      } else {
        setBanner(bannerFromError(err));
      }
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (resetMut.isPending) return;

    clearAll();
    setBanner(null);
    setSuccess(null);

    if (!onboardingToken) {
      setBanner('Session expired. Please restart the recovery flow.');
      return;
    }

    let hasClientError = false;
    if (!pin) {
      setError('pin', 'New PIN is required.');
      hasClientError = true;
    } else if (!isValidPin(pin)) {
      setError('pin', 'PIN must be 4 to 6 digits.');
      hasClientError = true;
    }
    if (!confirmPin) {
      setError('confirmPin', 'Please confirm your new PIN.');
      hasClientError = true;
    } else if (pin && confirmPin && pin !== confirmPin) {
      setError('confirmPin', 'PINs do not match.');
      hasClientError = true;
    }
    if (hasClientError) return;

    try {
      await resetMut.mutateAsync({
        onboarding_token: onboardingToken,
        pin,
      });
      setSuccess('PIN reset successful. Redirecting to sign in…');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      const field = mapApiErrorToField(err, ['pin', 'confirmPin']);
      if (field) {
        setError(field, err instanceof ApiError ? err.body.message : 'Invalid PIN.');
      } else {
        setBanner(bannerFromError(err));
      }
    }
  };

  const isSubmitting = forgotMut.isPending || resetMut.isPending;

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-logo">
          <div className="login-logo-icon">
            <ShieldCheck size={28} />
          </div>
          <h1>Harvite</h1>
          <p>Reset your PIN</p>
        </div>

        <div className="login-container-premium fade-in">
          <div className="credentials-view">
            <p style={{ marginBottom: '16px' }}>
              <a
                href="/login"
                style={{
                  color: 'var(--blue)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={14} /> Back to sign in
              </a>
            </p>

            {step === 1 && (
              <>
                <h2 className="login-title">Forgot your PIN?</h2>
                <p className="login-subtitle">
                  Enter the phone number on your account. We&apos;ll start a
                  secure PIN reset.
                </p>
                <form onSubmit={handleSendCode} className="login-form" noValidate>
                  <Input
                    label="Phone Number"
                    placeholder="+2348012345678"
                    icon={<Phone size={16} />}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    autoComplete="tel"
                    error={errors['phone']}
                    disabled={isSubmitting}
                    required
                  />

                  {banner && (
                    <div
                      role="alert"
                      style={{
                        marginTop: '16px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 59, 48, 0.08)',
                        color: '#B42318',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {banner}
                    </div>
                  )}

                  <div className="login-submit" style={{ marginTop: '24px' }}>
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {forgotMut.isPending ? 'Sending…' : 'Send Reset Code'}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="login-title">Set a new PIN</h2>
                <p className="login-subtitle">
                  Choose a new 4 to 6 digit PIN. It must be different from your
                  last 3 PINs.
                </p>
                <form onSubmit={handleReset} className="login-form" noValidate>
                  <Input
                    label="New PIN"
                    type="password"
                    placeholder="••••"
                    icon={<Lock size={16} />}
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    error={errors['pin']}
                    disabled={isSubmitting}
                    required
                  />
                  <Input
                    label="Confirm New PIN"
                    type="password"
                    placeholder="••••"
                    icon={<Lock size={16} />}
                    value={confirmPin}
                    onChange={(e) => handleConfirmChange(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    error={errors['confirmPin']}
                    disabled={isSubmitting}
                    required
                  />

                  {banner && (
                    <div
                      role="alert"
                      style={{
                        marginTop: '16px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 59, 48, 0.08)',
                        color: '#B42318',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {banner}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      style={{
                        marginTop: '16px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(52, 199, 89, 0.12)',
                        color: '#0F7A2E',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {success}
                    </div>
                  )}

                  <div className="login-submit" style={{ marginTop: '24px' }}>
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {resetMut.isPending ? 'Saving…' : 'Reset PIN'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
