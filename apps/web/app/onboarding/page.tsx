"use client";

import React, { useEffect, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBrand } from '@/contexts/BrandContext';
import {
  useOnboardingStart,
  useOnboardingAccount,
  useOnboardingSubdomain,
  useOnboardingBrand,
  useOnboardingLocation,
  useOnboardingComplete,
} from '@/services/onboarding';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import {
  isE164,
  isHexColor,
  isIsoCountryCode,
  isValidPin,
  isValidSubdomain,
  logoErrorMessage,
  toE164,
} from '@/lib/forms/validators';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  ShieldCheck,
  Smartphone,
  Upload,
  Check,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import './onboarding.css';

const countryCodes = [
  { code: '+234', country: 'NG', name: 'Nigeria' },
  { code: '+1', country: 'US', name: 'USA' },
  { code: '+44', country: 'UK', name: 'UK' },
  { code: '+233', country: 'GH', name: 'Ghana' },
  { code: '+27', country: 'SA', name: 'South Africa' },
  { code: '+254', country: 'KE', name: 'Kenya' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [subdomain, setSubdomain] = useState('');

  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [locationName, setLocationName] = useState('Headquarters');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [country, setCountry] = useState('NG');

  const { errors, setError, clearAll, bindField } = useFieldErrors();
  const { updateSettings } = useBrand();
  const router = useRouter();

  const startMut = useOnboardingStart();
  const accountMut = useOnboardingAccount();
  const subdomainMut = useOnboardingSubdomain();
  const brandMut = useOnboardingBrand();
  const locationMut = useOnboardingLocation();
  const completeMut = useOnboardingComplete();

  const isSubmitting =
    startMut.isPending ||
    accountMut.isPending ||
    subdomainMut.isPending ||
    brandMut.isPending ||
    locationMut.isPending ||
    completeMut.isPending;

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    if (errors['orgName']) clearAll();
    if (!subdomain) {
      setSubdomain(value.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      setError('logoFile', '');
      return;
    }
    const logoErr = logoErrorMessage(file);
    if (logoErr) {
      setError('logoFile', logoErr);
      return;
    }
    setError('logoFile', '');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleStart = async () => {
    clearAll();

    if (!phoneNumber) {
      setError('phoneNumber', 'Phone number is required.');
      return;
    }
    if (!isE164(toE164(countryCode, phoneNumber))) {
      setError('phoneNumber', 'Enter a valid phone number, e.g. +2348012345678.');
      return;
    }

    try {
      const result = await startMut.mutateAsync({
        phone: toE164(countryCode, phoneNumber),
      });
      setOnboardingToken(result.onboarding_token);
      setStep(2);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Invalid phone number.'));
    }
  };

  const handleAccount = async () => {
    if (!onboardingToken) {
      toast.error('Session expired. Please restart onboarding.');
      return;
    }
    clearAll();

    let hasClientError = false;
    if (!orgName) {
      setError('orgName', 'Organization name is required.');
      hasClientError = true;
    }
    if (!adminName) {
      setError('adminName', 'Administrator name is required.');
      hasClientError = true;
    }
    if (!pin) {
      setError('pin', 'PIN is required.');
      hasClientError = true;
    } else if (!isValidPin(pin)) {
      setError('pin', 'PIN must be 4 to 6 digits.');
      hasClientError = true;
    }
    if (!confirmPin) {
      setError('confirmPin', 'Please confirm your PIN.');
      hasClientError = true;
    } else if (pin && confirmPin && pin !== confirmPin) {
      setError('confirmPin', 'PINs do not match.');
      hasClientError = true;
    }
    if (hasClientError) return;

    try {
      const result = await accountMut.mutateAsync({
        onboarding_token: onboardingToken,
        organization_name: orgName,
        admin_name: adminName,
        pin,
      });
      setOnboardingToken(result.onboarding_token);
      setOrganizationId(result.organization_id);
      setStep(3);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not save your account details.'));
    }
  };

  const handleSubdomain = async () => {
    if (!onboardingToken) {
      toast.error('Session expired. Please restart onboarding.');
      return;
    }
    clearAll();

    if (!subdomain) {
      setError('subdomain', 'Subdomain is required.');
      return;
    }
    if (!isValidSubdomain(subdomain)) {
      setError(
        'subdomain',
        'Use 3 to 30 lowercase letters, numbers, or hyphens. Reserved names are not allowed.',
      );
      return;
    }

    try {
      const result = await subdomainMut.mutateAsync({
        onboarding_token: onboardingToken,
        subdomain,
      });
      setOnboardingToken(result.onboarding_token);
      setStep(4);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Invalid subdomain.'));
    }
  };

  const handleBrand = async () => {
    if (!onboardingToken) {
      toast.error('Session expired. Please restart onboarding.');
      return;
    }
    clearAll();

    if (!isHexColor(primaryColor)) {
      setError('primaryColor', 'Pick a valid hex color, e.g. #007AFF.');
      return;
    }

    try {
      const result = await brandMut.mutateAsync({
        onboarding_token: onboardingToken,
        primary_color: primaryColor,
        logo: logoFile ?? undefined,
      });
      setOnboardingToken(result.onboarding_token);
      updateSettings({
        organizationName: orgName,
        primaryColor: result.primary_color,
        logoUrl: result.logo_url,
      });
      setStep(5);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not save your brand details.'));
    }
  };

  const handleLocation = async () => {
    if (!onboardingToken) {
      toast.error('Session expired. Please restart onboarding.');
      return;
    }
    clearAll();

    let hasClientError = false;
    if (!locationName) {
      setError('locationName', 'Location name is required.');
      hasClientError = true;
    }
    if (!address) {
      setError('address', 'Address is required.');
      hasClientError = true;
    }
    if (!city) {
      setError('city', 'City is required.');
      hasClientError = true;
    }
    if (!stateVal) {
      setError('stateVal', 'State or region is required.');
      hasClientError = true;
    }
    if (!country) {
      setError('country', 'Country is required.');
      hasClientError = true;
    } else if (!isIsoCountryCode(country)) {
      setError('country', 'Use a 2-letter ISO country code, e.g. NG.');
      hasClientError = true;
    }
    if (hasClientError) return;

    try {
      const result = await locationMut.mutateAsync({
        onboarding_token: onboardingToken,
        name: locationName,
        address,
        city,
        state: stateVal,
        country,
      });
      setLocationId(result.location_id);
      setStep(6);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not create your location.'));
    }
  };

  const handleComplete = async () => {
    if (!onboardingToken) {
      toast.error('Session expired. Please restart onboarding.');
      return;
    }
    clearAll();

    try {
      await completeMut.mutateAsync({
        onboarding_token: onboardingToken,
      });
      setOnboardingToken(null);
      router.push('/main');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not finalize onboarding.'));
    }
  };

  const handleBack = () => {
    clearAll();
    setStep((s) => Math.max(1, s - 1));
  };

  const renderProgress = () => (
    <div className="onboarding-progress">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`progress-dot ${step >= i ? 'active' : ''}`}
        />
      ))}
    </div>
  );

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value.replace(/\D/g, ''));
    if (errors['phoneNumber']) clearAll();
  };
  const handleSubdomainChange = (value: string) => {
    setSubdomain(value.toLowerCase().replace(/\s+/g, '-'));
    if (errors['subdomain']) clearAll();
  };
  const handleCountryChange = (value: string) => {
    setCountry(value.toUpperCase().slice(0, 2));
    if (errors['country']) clearAll();
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {step > 1 && step < 6 && (
          <button
            className="onboarding-back-btn"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}

        {renderProgress()}

        {step === 1 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="step-icon-circle">
                <Smartphone size={28} />
              </div>
              <h1>Let&apos;s start with your phone</h1>
              <p>
                Enter the phone number for your organization&apos;s primary
                admin account.
              </p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="input-group-with-desc">
                  <div className="input-wrapper">
                    <label className="input-label">Phone Number</label>
                    <div className="phone-input-group">
                      <div className="country-selector-wrapper">
                        <select
                          className="country-select"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          disabled={isSubmitting}
                        >
                          {countryCodes.map((c) => (
                            <option key={c.country} value={c.code}>
                              {c.country} {c.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="selector-arrow" />
                      </div>
                      <input
                        type="tel"
                        className={`phone-number-field ${errors['phoneNumber'] ? 'input-error' : ''}`}
                        placeholder="801 234 5678"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    {errors['phoneNumber'] && (
                      <span className="input-error-text">
                        {errors['phoneNumber']}
                      </span>
                    )}
                  </div>
                  <span className="field-desc">
                    E.164 format, e.g. +2348012345678.
                  </span>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleStart}
                  disabled={isSubmitting}
                >
                  {startMut.isPending ? 'Starting…' : 'Continue'}{' '}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="step-icon-circle">
                <Building2 size={28} />
              </div>
              <h1>Create your administrator account</h1>
              <p>Tell us about your organization and the primary admin.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <Input
                  label="Organization Name"
                  placeholder="e.g. Grace Covenant Church"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  error={errors['orgName']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="Admin Full Name"
                  placeholder="Pastor Ayo"
                  value={adminName}
                  onChange={(e) => bindField('adminName', setAdminName)(e.target.value)}
                  error={errors['adminName']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="Security PIN (4 to 6 digits)"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => bindField('pin', setPin)(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  icon={<ShieldCheck size={16} />}
                  error={errors['pin']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="Confirm PIN"
                  type="password"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => bindField('confirmPin', setConfirmPin)(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  error={errors['confirmPin']}
                  disabled={isSubmitting}
                  required
                />
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleAccount}
                  disabled={isSubmitting}
                >
                  {accountMut.isPending ? 'Saving…' : 'Continue'}{' '}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="step-icon-circle">
                <LinkIcon size={28} />
              </div>
              <h1>Claim your subdomain</h1>
              <p>This is the unique web address for your organization.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="subdomain-preview">
                  <div className="subdomain-input-box">
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      disabled={isSubmitting}
                      className={errors['subdomain'] ? 'input-error' : ''}
                    />
                    <span>.harvite.app</span>
                  </div>
                </div>
                {errors['subdomain'] && (
                  <span className="input-error-text">
                    {errors['subdomain']}
                  </span>
                )}
                <p className="hint-text">
                  3 to 30 characters. Lowercase letters, numbers, and hyphens
                  only.
                </p>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSubdomain}
                  disabled={isSubmitting}
                >
                  {subdomainMut.isPending ? 'Reserving…' : 'Reserve Subdomain'}{' '}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="step-icon-circle">
                <Building2 size={28} />
              </div>
              <h1>Brand identity</h1>
              <p>Make the platform feel like home for your members.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <label className="input-label">Organization Logo</label>
                <label
                  className={`onboarding-logo-upload ${errors['logoFile'] ? 'has-error' : ''}`}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" />
                  ) : (
                    <Upload size={24} />
                  )}
                  <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                    disabled={isSubmitting}
                  />
                </label>
                {errors['logoFile'] && (
                  <span className="input-error-text">
                    {errors['logoFile']}
                  </span>
                )}
                <span className="field-desc">
                  Optional. PNG, JPG, or SVG up to 1MB.
                </span>

                <label className="input-label">Primary Brand Color</label>
                <div className="onboarding-color-select">
                  {['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF3B30'].map(
                    (c) => (
                      <div
                        key={c}
                        className={`color-option ${primaryColor === c ? 'active' : ''}`}
                        style={{ background: c }}
                        onClick={() => !isSubmitting && setPrimaryColor(c)}
                      >
                        {primaryColor === c && <Check size={14} color="white" />}
                      </div>
                    ),
                  )}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      if (errors['primaryColor']) clearAll();
                    }}
                    className={`custom-color-trigger ${errors['primaryColor'] ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors['primaryColor'] && (
                  <span className="input-error-text">
                    {errors['primaryColor']}
                  </span>
                )}
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleBrand}
                  disabled={isSubmitting}
                >
                  {brandMut.isPending ? 'Uploading…' : 'Save & Continue'}{' '}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <div className="step-icon-circle">
                <MapPin size={28} />
              </div>
              <h1>Headquarters location</h1>
              <p>Every organization starts with its first operational hub.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <Input
                  label="Location Name"
                  placeholder="Headquarters"
                  value={locationName}
                  onChange={(e) => bindField('locationName', setLocationName)(e.target.value)}
                  error={errors['locationName']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="Address"
                  placeholder="12 Redemption Way"
                  value={address}
                  onChange={(e) => bindField('address', setAddress)(e.target.value)}
                  icon={<MapPin size={16} />}
                  error={errors['address']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="City"
                  placeholder="Lagos"
                  value={city}
                  onChange={(e) => bindField('city', setCity)(e.target.value)}
                  error={errors['city']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="State / Region"
                  placeholder="Lagos"
                  value={stateVal}
                  onChange={(e) => bindField('stateVal', setStateVal)(e.target.value)}
                  error={errors['stateVal']}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label="Country (ISO code)"
                  placeholder="NG"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  maxLength={2}
                  error={errors['country']}
                  disabled={isSubmitting}
                  required
                />
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleLocation}
                  disabled={isSubmitting}
                >
                  {locationMut.isPending ? 'Creating…' : 'Create Location'}{' '}
                  <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 6 && (
          <div className="onboarding-step-view">
            <Card className="onboarding-card success-onboarding">
              <div className="success-lottie">✨</div>
              <h1>You&apos;re all set!</h1>
              <p>
                Your organization system has been established. You can now start
                adding workers and tracking progress.
              </p>
              <div className="onboarding-summary">
                <div className="summary-item">
                  <CheckCircle2 size={16} /> Subdomain: {subdomain}.harvite.app
                </div>
                <div className="summary-item">
                  <CheckCircle2 size={16} /> Admin: {adminName}
                </div>
                <div className="summary-item">
                  <CheckCircle2 size={16} /> Location: {locationName}
                </div>
                {organizationId && (
                  <div className="summary-item">
                    <CheckCircle2 size={16} /> Organization ID:{' '}
                    {organizationId}
                  </div>
                )}
                {locationId && (
                  <div className="summary-item">
                    <CheckCircle2 size={16} /> Location ID: {locationId}
                  </div>
                )}
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {completeMut.isPending ? 'Finalizing…' : 'Go to Dashboard'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
