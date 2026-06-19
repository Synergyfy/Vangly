"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft,
  Check,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';
import '../management.css';

export default function SubscriptionManagementPage() {
  const router = useRouter();
  
  // Mock data for the current subscription
  const currentPlan = "Growth";
  const planPrice = 10000;
  const locationsUsed = 4;
  const planLimit = 4; // Assuming Growth usually has 5, but let's say they hit the limit of 4 for testing or maybe limit is 4
  const additionalPurchased = 0;
  const additionalCostPerLocation = 2000;
  const totalLocationsAllowed = planLimit + additionalPurchased;
  
  const additionalLocationsCost = additionalPurchased * additionalCostPerLocation;
  const totalMonthlyCost = planPrice + additionalLocationsCost;

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.push('/main')} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Billing</div>
            <h1>Subscription &amp; Billing</h1>
            <p>Manage your Harvite plan and add-ons.</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Current Plan Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card className="glass-morphism" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Current Plan</div>
                  <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--primary)' }}>{currentPlan}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>₦{planPrice.toLocaleString()}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>per month</div>
                </div>
              </div>
              
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Plan Benefits</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}><Check size={16} color="var(--primary)" /> Up to 5 Locations</li>
                  <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}><Check size={16} color="var(--primary)" /> Messaging Tools</li>
                  <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}><Check size={16} color="var(--primary)" /> Data Export</li>
                  <li style={{ display: 'flex', gap: '8px', fontSize: '14px' }}><Check size={16} color="var(--primary)" /> Priority Email Support</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button className="btn-secondary" style={{ flex: 1 }}>Upgrade Plan</Button>
              </div>
            </Card>

            {/* Total Monthly Cost */}
            <Card className="glass-morphism" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Billing Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{currentPlan} Plan</span>
                <span>₦{planPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Additional Locations ({additionalPurchased})</span>
                <span>₦{additionalLocationsCost.toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Total Monthly Cost</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>₦{totalMonthlyCost.toLocaleString()}</span>
              </div>
            </Card>
          </div>

          {/* Usage & Add-ons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card className="glass-morphism" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Location Usage</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Monitor your limits</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{locationsUsed} <span style={{ color: 'var(--text-muted)' }}>of {totalLocationsAllowed} Used</span></span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: Math.max(totalLocationsAllowed, locationsUsed) }).map((_, idx) => (
                    <div key={idx} style={{ height: '8px', flex: 1, backgroundColor: idx < locationsUsed ? (locationsUsed >= totalLocationsAllowed ? 'var(--orange)' : 'var(--primary)') : 'var(--border-light)', borderRadius: '4px' }} />
                  ))}
                </div>
                {locationsUsed >= totalLocationsAllowed && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3ed', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color="var(--orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '13px', color: '#c2410c', margin: 0 }}>You have reached your location limit. You must purchase more locations to expand.</p>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Additional Locations</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>₦2,000/mo per location</div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{additionalPurchased} Purchased</div>
                </div>
              </div>

              <Button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/main/subscription/purchase')}>
                Purchase Location
              </Button>
            </Card>

            <Card className="glass-morphism" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>Payment Method</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Manage your cards</div>
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, border: '1px solid var(--border)' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>•••• 4242</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Expires 12/28</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Update</Button>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
