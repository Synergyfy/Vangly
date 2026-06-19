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

  // Step 5: Subscription
  const [selectedPlan, setSelectedPlan] = useState('Free Plan');
  const [locationCount, setLocationCount] = useState(0); // For Add Location add-on
  const [contactSalesModalOpen, setContactSalesModalOpen] = useState(false);
  const [contactThankYou, setContactThankYou] = useState(false);
  const [contactModalPlan, setContactModalPlan] = useState('Enterprise Plan');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  const plans = [
    { 
      name: 'Free Plan', price: 0, authFee: 1000, isContactSales: false,
      description: 'Ideal for small or starting organizations. Includes 1 Location, unlimited teams, and basic features.'
    },
    { 
      name: 'Growth Plan', price: 10000, authFee: 0, isContactSales: false,
      description: 'Perfect for scaling organizations. Up to 5 Locations, data export, and priority support.'
    },
    { 
      name: 'Network Plan', price: 25000, authFee: 0, isContactSales: false,
      description: 'For large networks. Up to 15 Locations, custom workflows, advanced analytics, and API access.'
    },
    { 
      name: 'Enterprise Plan', price: 0, authFee: 0, isContactSales: true,
      description: 'Unlimited capacity. Dedicated account manager, custom SLAs, and full enterprise features.'
    },
    { 
      name: 'White-Label Plan', price: 0, authFee: 0, isContactSales: true,
      description: 'Fully rebrand the platform as your own. Custom mobile app, your domains, and hidden Invitely branding.'
    }
  ];

  const handleSelectPlan = (planName: string, isContactSales: boolean) => {
    setSelectedPlan(planName);
    if (isContactSales) {
      setContactModalPlan(planName);
      setContactName(adminName);
      setContactPhone(`${countryCode}${phoneNumber}`);
      setContactAddress(locationAddr);
      setContactSalesModalOpen(true);
    } else {
      setContactSalesModalOpen(false);
    }
  };

  const handleContactSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSalesModalOpen(false);
    setContactThankYou(true);
  };

  const handleThankYouWait = () => {
    setContactThankYou(false);
    router.push('/');
  };

  const handleThankYouContinue = () => {
    setContactThankYou(false);
    setSelectedPlan('Free Plan');
    setStep(6); // Go directly to payment step
  };

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
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="onboarding-page">
      
      {/* Contact Sales Modal */}
      {contactSalesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Contact Sales</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Tell us about your needs and we'll reach out immediately.</p>
            </div>
            <form onSubmit={handleContactSalesSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Plan Switcher */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Selected Plan</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Enterprise Plan', 'White-Label Plan'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setContactModalPlan(p)}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                        border: contactModalPlan === p ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: contactModalPlan === p ? 'var(--blue-subtle)' : 'var(--bg-secondary)',
                        color: contactModalPlan === p ? 'var(--primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {p.replace(' Plan', '')}
                    </button>
                  ))}
                </div>
                {/* Description of selected modal plan */}
                <div style={{ marginTop: '10px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '3px solid var(--primary)' }}>
                  {contactModalPlan === 'Enterprise Plan'
                    ? 'Unlimited capacity. Dedicated account manager, custom SLAs, advanced security, and full enterprise features tailored to your organization.'
                    : 'Fully rebrand the platform as your own. Custom mobile app, your own domains, hidden Harvite branding, and a fully bespoke experience for your members.'}
                </div>
              </div>

              {/* Pre-populated Contact Info */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Address</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="Your business address"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Expected Organization Size</label>
                <select style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px' }} required>
                  <option value="">Select size...</option>
                  <option value="1-50">1 - 50 members</option>
                  <option value="51-200">51 - 200 members</option>
                  <option value="201-500">201 - 500 members</option>
                  <option value="500+">500+ members</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Specific Needs or Requirements</label>
                <textarea rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '14px' }} placeholder="e.g. We need a custom mobile app and API access..." required></textarea>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button type="button" variant="outline" onClick={() => { setContactSalesModalOpen(false); setSelectedPlan('Free Plan'); }}>Cancel</Button>
                <Button type="submit" className="btn-primary">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thank You Screen */}
      {contactThankYou && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', maxWidth: '440px', width: '100%', textAlign: 'center', padding: '48px 32px', animation: 'modalSlideUp 0.3s var(--ease)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Thank You!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Your request has been received successfully. Our sales team will review your requirements and get back to you within <strong>24 hours</strong>.
            </p>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              In the meantime, you can continue setting up your organization on the <strong>Free Plan</strong>. Once your request is approved, we'll seamlessly upgrade your account.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button fullWidth size="lg" className="btn-primary" onClick={handleThankYouContinue}>
                Continue with Free Plan
              </Button>
              <button 
                onClick={handleThankYouWait}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                I'll wait for your response
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="onboarding-container">
        {renderProgress()}

        {step === 1 && (
          <div className="onboarding-step-view">
            <button className="onboarding-back-btn" onClick={() => router.push('/')}>
              <ArrowLeft size={18} /> Back to Home
            </button>
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
            <button className="onboarding-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Back
            </button>
            <div className="step-header">
              <h1>Your Organization name</h1>
              <p>This is where your staff and guests will access the system.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                <div className="subdomain-preview">
                  <div className="subdomain-input-box">
                    <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
                    <span>.harvite.com</span>
                  </div>
                </div>
                <p className="hint-text">A unique web address for your organization portal.</p>
                <Button fullWidth size="lg" onClick={handleNext} disabled={!subdomain}>
                  Reserve Name <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step-view">
            <button className="onboarding-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Back
            </button>
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
            <button className="onboarding-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Back
            </button>
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

        {step < 7 && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Already have an Account? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</a>
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step-view">
            <button className="onboarding-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Back
            </button>
            <div className="step-header">
              <h1>Choose your Subscription</h1>
              <p>Select a plan that fits your organization's needs.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {plans.map(plan => (
                    <div 
                      key={plan.name}
                      onClick={() => handleSelectPlan(plan.name, plan.isContactSales)}
                      style={{ 
                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                        border: selectedPlan === plan.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedPlan === plan.name ? 'var(--blue-subtle)' : 'var(--bg-primary)',
                        transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: selectedPlan === plan.name ? 'var(--primary)' : 'var(--text-primary)' }}>{plan.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {plan.isContactSales ? 'Contact Sales' : (plan.price === 0 ? 'Free forever' : `₦${plan.price.toLocaleString()} / month`)}
                          </div>
                        </div>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedPlan === plan.name ? '6px solid var(--primary)' : '2px solid var(--border)', transition: 'all 0.2s' }}></div>
                      </div>
                      
                      {/* Tooltip / Description inline when selected */}
                      {selectedPlan === plan.name && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${selectedPlan === plan.name ? 'var(--blue-light)' : 'var(--border)'}`, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {plan.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedPlan === 'Free Plan' && (
                  <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', lineHeight: 1.5 }}>
                    <strong>One-Time Authentication Fee:</strong><br/>
                    To authenticate your account and verify you as the subscriber, a 1-time authentication fee of <strong>₦1,000</strong> applies.
                  </div>
                )}

                <h3 style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>Optional Add-ons</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>Additional Location</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>+₦2,000 per location</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
                      <button 
                        onClick={() => setLocationCount(Math.max(0, locationCount - 1))}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{locationCount}</span>
                      <button 
                        onClick={() => setLocationCount(locationCount + 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Due Today:</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₦{(() => {
                      const activePlan = plans.find(p => p.name === selectedPlan);
                      const basePrice = activePlan?.price || 0;
                      const authPrice = activePlan?.authFee || 0;
                      const addonsPrice = locationCount * 2000;
                      return (basePrice + authPrice + addonsPrice).toLocaleString();
                    })()}
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={handleNext} style={{ marginTop: '8px' }}>
                  Checkout & Complete <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 6 && (
          <div className="onboarding-step-view">
            <button className="onboarding-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Back
            </button>
            <div className="step-header">
              <h1>Complete Payment</h1>
              <p>Review your order and confirm payment to get started.</p>
            </div>
            <Card className="onboarding-card">
              <div className="form-stack">
                {/* Order Summary */}
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>Order Summary</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedPlan}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {(() => { const p = plans.find(pl => pl.name === selectedPlan); return p && p.price > 0 ? `₦${p.price.toLocaleString()}/mo` : 'Free'; })()}
                    </span>
                  </div>

                  {selectedPlan === 'Free Plan' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Authentication Fee</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>One-time account verification</div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₦1,000</span>
                    </div>
                  )}

                  {locationCount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Additional Locations ×{locationCount}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>₦{(locationCount * 2000).toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>Total</span>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₦{(() => {
                        const activePlan = plans.find(p => p.name === selectedPlan);
                        const basePrice = activePlan?.price || 0;
                        const authPrice = activePlan?.authFee || 0;
                        const addonsPrice = locationCount * 2000;
                        return (basePrice + authPrice + addonsPrice).toLocaleString();
                      })()}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>Payment Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Card Payment', 'Bank Transfer', 'USSD'].map(method => (
                      <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                        <input type="radio" name="paymentMethod" defaultChecked={method === 'Card Payment'} style={{ accentColor: 'var(--primary)' }} />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534', lineHeight: 1.5, marginTop: '4px' }}>
                  🔒 Your payment is secured with 256-bit encryption. We do not store your card details.
                </div>

                <Button fullWidth size="lg" onClick={handleNext} style={{ marginTop: '8px' }}>
                  Pay & Complete Setup <ChevronRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 7 && (
          <div className="onboarding-step-view">
            <Card className="onboarding-card success-onboarding">
              <div className="success-lottie">✨</div>
              <h1>You're all set!</h1>
              <p>Your Organization System has been established. You can now start adding workers and tracking progress.</p>
              <div className="onboarding-summary">
                <div className="summary-item"><CheckCircle2 size={16} /> Name: {subdomain}.harvite.com</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Admin: {adminName}</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Location: {locationName}</div>
                <div className="summary-item"><CheckCircle2 size={16} /> Plan: {selectedPlan}</div>
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
