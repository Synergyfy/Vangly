"use client";

import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { mapApiErrorToField } from '@/lib/forms/map-api-error-to-field';
import { isE164, isValidPin } from '@/lib/forms/validators';
import { Lock, Phone } from 'lucide-react';
import type { UserRole } from '@/types/api/auth';
import './login.css';

type AuthErrorKey =
  | { kind: 'invalid_credentials' }
  | { kind: 'locked' }
  | { kind: 'suspended' }
  | { kind: 'network' }
  | { kind: 'unknown' };

function classifyAuthError(err: unknown): AuthErrorKey {
  if (!(err instanceof ApiError)) {
    return { kind: 'network' };
  }
  if (err.status === 401) return { kind: 'invalid_credentials' };
  if (err.status === 423) return { kind: 'locked' };
  if (err.status === 403) return { kind: 'suspended' };
  return { kind: 'unknown' };
}

function bannerMessage(key: AuthErrorKey): string {
  switch (key.kind) {
    case 'invalid_credentials':
      return 'Invalid phone or PIN. Please try again.';
    case 'locked':
      return 'Account locked due to too many failed attempts. Try again in 10 minutes.';
    case 'suspended':
      return 'Your account has been suspended. Contact your organization admin.';
    case 'network':
      return 'Cannot reach the server. Check your connection and try again.';
    case 'unknown':
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const { errors, setError, clearAll, bindField } = useFieldErrors();
  const { login, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const handlePhoneChange = bindField('phone', setPhoneNumber);
  const handlePinChange = bindField('pin', setPassword);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    clearAll();
    setBanner(null);

    let hasClientError = false;
    if (!phoneNumber) {
      setError('phone', 'Phone number is required.');
      hasClientError = true;
    } else if (!isE164(phoneNumber)) {
      setError('phone', 'Enter a valid phone number, e.g. +2348012345678.');
      hasClientError = true;
    }
    if (!password) {
      setError('pin', 'PIN is required.');
      hasClientError = true;
    } else if (!isValidPin(password)) {
      setError('pin', 'PIN must be 4 to 6 digits.');
      hasClientError = true;
    }
    if (hasClientError) return;

    setIsLoading(true);
    try {
      const user = await login({
        phone: phoneNumber,
        pin: password,
        remember: true,
      });
      routeForRole(user.role);
    } catch (err) {
      const field = mapApiErrorToField(err, ['phone', 'pin']);
      if (field) {
        const message =
          err instanceof ApiError
            ? err.body.message
            : 'Invalid value.';
        setError(field, message);
      } else {
        setBanner(bannerMessage(classifyAuthError(err)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const routeForRole = (role: UserRole) => {
    if (role === 'super_admin' || role === 'organization_admin') {
      router.push('/main');
    } else if (role === 'location_admin') {
      router.push('/branch');
    } else {
      router.push('/worker');
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1>Vangly</h1>
          <p>Organization management platform</p>
        </div>

        <div className="login-container-premium fade-in">
          <div className="credentials-view">
            <h2 className="login-title">Sign in to your account</h2>
            <p className="login-subtitle">
              Enter your details to access your dashboard
            </p>

            <form onSubmit={handleLogin} className="login-form" noValidate>
              <Input
                label="Phone Number"
                placeholder="+2348012345678"
                icon={<Phone size={16} />}
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                autoComplete="tel"
                error={errors['phone']}
                disabled={isLoading}
                required
              />

              <Input
                label="PIN"
                type="password"
                placeholder="••••"
                icon={<Lock size={16} />}
                value={password}
                onChange={(e) => handlePinChange(e.target.value)}
                autoComplete="current-password"
                inputMode="numeric"
                error={errors['pin']}
                disabled={isLoading}
                required
              />

              <p
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  textAlign: 'right',
                }}
              >
                <a
                  href="/forgot-pin"
                  style={{ color: 'var(--blue)', fontWeight: 700 }}
                >
                  Forgot PIN?
                </a>
              </p>

              {banner && (
                <div
                  className="auth-error-banner"
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
                  disabled={isLoading || isAuthLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <p
              className="login-footer"
              style={{ marginTop: '24px', textAlign: 'center' }}
            >
              New here?{' '}
              <a
                href="/onboarding"
                style={{ color: 'var(--blue)', fontWeight: 700 }}
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
