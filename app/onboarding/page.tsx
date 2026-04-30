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
  const [churchName, setChurchName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');

  // Step 2: OTP
  const [otp, setOtp] = useState('');

  // Step 3: Subdomain
  const [subdomain, setSubdomain] = useState('');

  // Step 4: Brand
  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 5: HQ Branch
  const [branchName, setBranchName] = useState('Headquarters');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (churchName) {
      setSubdomain(churchName.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [churchName]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = () => {
    setIsLoading(true);
    updateSettings({
      churchName,
      primaryColor,
      logoUrl: logoPreview
    });

    setTimeout(() => {
      login({
        id: 'hq_admin',
        name: adminName,
        role: 'super_admin',
        church_id: subdomain
      });
      router.push('/hq');
    }, 1500);
  };

  const renderProgress = () => (
    <div className="onboarding-progress">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {renderProgress()}

        {step === 1 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Let's build your church system</h1>
              <p>Start by creating your main administrator account.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <Input label="Church Name" placeholder="Grace Community Church" value={churchName} onChange={(e) => setChurchName(e.target.value)} required />
                <Input label="Admin Full Name" placeholder="John Doe" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                
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

                <Input label="Security PIN (6 digits)" type="password" placeholder="••••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
                <Button fullWidth size="lg" onClick={handleNext} disabled={!churchName || !adminName || !phoneNumber || pin.length < 6}>
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Verify your number</h1>
              <p>We've sent a 4-digit code to {countryCode}{phoneNumber}</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <Input 
                  label="Enter OTP" 
                  placeholder="0 0 0 0" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  maxLength={4} 
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                />
                <Button fullWidth size="lg" onClick={handleNext} disabled={otp.length < 4}>
                  Verify & Continue
                </Button>
                <Button variant="ghost" fullWidth onClick={() => {}}>Resend Code</Button>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Your church domain</h1>
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
                <p className="hint-text">You can change this later in settings.</p>
                <Button fullWidth size="lg" onClick={handleNext} disabled={!subdomain}>
                  Reserve Domain <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Brand Identity</h1>
              <p>Make the platform feel like home for your church members.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <label className="input-label">Church Logo</label>
                <div className="onboarding-logo-upload" onClick={() => {}}>
                  {logoPreview ? <img src={logoPreview} alt="" /> : <Upload size={24} />}
                  <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                </div>
                
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

                <Button fullWidth size="lg" onClick={handleNext}>
                  Save & Continue
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step-view">
            <div className="step-header">
              <h1>Create first branch</h1>
              <p>Every church starts with its first location (usually Headquarters).</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <Input label="Branch Name" placeholder="Headquarters" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
                <Input label="Location (Optional)" placeholder="e.g. Lagos, Nigeria" value={location} onChange={(e) => setLocation(e.target.value)} icon={<MapPin size={16} />} />
                <Button fullWidth size="lg" onClick={handleNext} disabled={!branchName}>
                  Create Branch
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 6 && (
          <div className="onboarding-step-view">
            <Card className="onboarding-card success-onboarding">
              <div className="success-lottie">✨</div>
              <h1>You're all set!</h1>
              <p>Your church system has been established. You can now start adding workers and tracking invites.</p>
              <div className="onboarding-summary">
                <div className="summary-item"><CheckCircle2 size={16} /> Domain: {subdomain}.vangly.com</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Admin: {adminName}</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Branch: {branchName}</div>
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
