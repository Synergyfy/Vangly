"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Palette, 
  Building2, 
  Link as LinkIcon, 
  ShieldCheck, 
  Smartphone,
  Upload,
  Image as ImageIcon,
  Check,
  ChevronDown,
  MapPin
} from 'lucide-react';
import './onboarding.css';

// Common country codes
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
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings, updateSettings } = useBrand();
  const router = useRouter();

  // Step 1: Account Creation
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Step 2: Subdomain
  const [subdomain, setSubdomain] = useState('');

  // Step 3: Brand
  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 4: HQ Location
  const [locationName, setLocationName] = useState('Headquarters');
  const [locationAddr, setLocationAddr] = useState('');

  useEffect(() => {
    if (orgName) {
      setSubdomain(orgName.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [orgName]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = () => {
    setIsLoading(true);
    updateSettings({
      organizationName: orgName, // Updated key
      primaryColor,
      logoUrl: logoPreview
    });

    setTimeout(() => {
      login({
        id: 'hq_admin',
        name: adminName,
        role: 'super_admin',
        organization_id: subdomain,
        credits: 100
      });
      router.push('/main');
    }, 1500);
  };

  const renderProgress = () => (
    <div className="onboarding-progress">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {step > 1 && step < 5 && (
          <button className="onboarding-back-btn" onClick={handleBack}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        
        {renderProgress()}

        {step === 1 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Let's build your Organization system</h1>
              <p>Start by creating your main administrator account.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="input-group-with-desc">
                  <Input label="Organization Name" placeholder="e.g. Synergyfy Global" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                  <span className="field-desc">The official name of your company or community.</span>
                </div>

                <div className="input-group-with-desc">
                  <Input label="Admin Full Name" placeholder="John Doe" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                  <span className="field-desc">The person who will have full access to this system.</span>
                </div>
                
                <div className="input-group-with-desc">
                  <div className="input-wrapper">
                    <label className="input-label">Phone Number</label>
                    <div className="phone-input-group">
                      <div className="country-selector-wrapper">
                        <select 
                          className="country-select" 
                          value={countryCode} 
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          {countryCodes.map(c => (
                            <option key={c.country} value={c.code}>{c.country} {c.code}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="selector-arrow" />
                      </div>
                      <input 
                        type="tel" 
                        className="phone-number-field" 
                        placeholder="801 234 5678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                  <span className="field-desc">Used for secure login and account recovery.</span>
                </div>

                <div className="input-group-with-desc">
                  <Input label="Security PIN (6 digits)" type="password" placeholder="••••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
                  <span className="field-desc">Choose a secret 6-digit number to protect your account.</span>
                </div>

                <div className="input-group-with-desc">
                  <Input label="Confirm Security PIN" type="password" placeholder="••••••" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
                  <span className="field-desc">Retype your 6-digit PIN to make sure it matches.</span>
                </div>

                <Button fullWidth size="lg" onClick={handleNext} disabled={!orgName || !adminName || !phoneNumber || pin.length < 6 || pin !== confirmPin}>
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Your Organization domain</h1>
              <p>This is where your staff and guests will access the system.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="subdomain-preview">
                  <div className="subdomain-input-box">
                    <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
                    <span>.vangly.com</span>
                  </div>
                </div>
                <p className="hint-text">A unique web address for your organization portal.</p>
                <Button fullWidth size="lg" onClick={handleNext} disabled={!subdomain}>
                  Reserve Domain <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Brand Identity</h1>
              <p>Make the platform feel like home for your members.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <label className="input-label">Organization Logo</label>
                <div className="onboarding-logo-upload" onClick={() => {}}>
                  {logoPreview ? <img src={logoPreview} alt="" /> : <Upload size={24} />}
                  <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                </div>
                <span className="field-desc">Upload a high-quality PNG or JPG of your logo.</span>
                
                <label className="input-label">Primary Brand Color</label>
                <div className="onboarding-color-select">
                  {['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF3B30'].map(c => (
                    <div 
                      key={c} 
                      className={`color-option ${primaryColor === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setPrimaryColor(c)}
                    >
                      {primaryColor === c && <Check size={14} color="white" />}
                    </div>
                  ))}
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="custom-color-trigger" />
                </div>
                <span className="field-desc">Pick a color that matches your brand identity.</span>

                <Button fullWidth size="lg" onClick={handleNext}>
                  Save & Continue
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Create First Location</h1>
              <p>Every organization starts with its first operational location.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="input-group-with-desc">
                  <Input label="Location Name" placeholder="Headquarters" value={locationName} onChange={(e) => setLocationName(e.target.value)} required />
                  <span className="field-desc">e.g. Lagos Office, Downtown Center, or HQ.</span>
                </div>

                <div className="input-group-with-desc">
                  <Input label="Address (Optional)" placeholder="e.g. 123 Main St, Lagos" value={locationAddr} onChange={(e) => setLocationAddr(e.target.value)} icon={<MapPin size={16} />} />
                  <span className="field-desc">The physical address of this location.</span>
                </div>

                <Button fullWidth size="lg" onClick={handleNext} disabled={!locationName}>
                  Create Location
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step-view">
            <Card className="onboarding-card success-onboarding">
              <div className="success-lottie">✨</div>
              <h1>You're all set!</h1>
              <p>Your Organization System has been established. You can now start adding workers and tracking progress.</p>
              <div className="onboarding-summary">
                <div className="summary-item"><CheckCircle2 size={16} /> Domain: {subdomain}.vangly.com</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Admin: {adminName}</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Location: {locationName}</div>
              </div>
              <Button fullWidth size="lg" onClick={handleFinish} disabled={isLoading}>
                {isLoading ? 'Preparing Dashboard...' : 'Go to Dashboard'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
