"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import '../../management.css';

export default function PurchaseLocationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const costPerLocation = 2000;
  const totalCost = quantity * costPerLocation;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/main/subscription');
  };

  const handlePurchase = () => {
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
    }, 1500);
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          {step !== 4 && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="back-btn-pill">
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Add-Ons</div>
            <h1>Purchase Additional Locations</h1>
            <p>Expand your network beyond your plan limits.</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main-content" style={{ display: 'flex', justifyContent: 'center' }}>
        <Card className="glass-morphism" style={{ maxWidth: '500px', width: '100%', padding: '32px', backgroundColor: 'var(--card-bg)' }}>
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ height: '4px', flex: 1, backgroundColor: s <= step ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }} />
              ))}
            </div>
          )}

          {/* Step 1: Select Quantity */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>How many locations do you need?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Additional locations cost ₦2,000/month each.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 5, 10].map(num => (
                  <div 
                    key={num}
                    onClick={() => setQuantity(num)}
                    style={{
                      border: `2px solid ${quantity === num ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: quantity === num ? 'var(--bg-primary)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 700, color: quantity === num ? 'var(--primary)' : 'var(--text-primary)' }}>+{num}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Locations</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Custom Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
                />
              </div>

              <Button className="btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Cost Preview */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Review your order</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Please review your additional location costs.</p>
              
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--blue)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Additional Locations</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Qty: {quantity} &times; ₦2,000/mo</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    ₦{totalCost.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>Due Today</div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>
                    ₦{totalCost.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '8px', marginBottom: '32px' }}>
                <CreditCard size={20} color="var(--blue)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#3730a3' }}>This amount will be billed immediately and added to your recurring monthly subscription.</p>
              </div>

              <Button className="btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                Proceed to Payment
              </Button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Payment Method</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Select a payment method to complete your purchase.</p>
              
              <div style={{ border: '2px solid var(--primary)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, border: '1px solid var(--border)' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>•••• 4242</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Expires 12/28</div>
                  </div>
                </div>
                <div style={{ width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: 'white' }} />
                </div>
              </div>

              <Button variant="outline" style={{ width: '100%', marginBottom: '32px' }}>
                + Add New Card
              </Button>

              <Button className="btn-primary" style={{ width: '100%' }} onClick={handlePurchase} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay ₦${totalCost.toLocaleString()}`}
              </Button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={40} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#166534' }}>Locations Added Successfully!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>You now have {quantity} additional location{quantity > 1 ? 's' : ''} available to use.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/main/manage-organization/new')}>
                  Create Location Now
                </Button>
                <Button variant="ghost" style={{ width: '100%' }} onClick={() => router.push('/main/subscription')}>
                  Return to Subscription
                </Button>
              </div>
            </div>
          )}

        </Card>
      </main>
    </div>
  );
}
