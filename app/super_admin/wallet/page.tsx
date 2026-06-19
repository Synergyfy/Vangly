"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Wallet, TrendingUp, CreditCard } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function WalletRevenuePage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wallet size={28} color="var(--green)" /> 
          Wallet &amp; Revenue
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage platform finances, payouts, and gateways.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card className="glass-morphism" style={{ padding: '24px', backgroundColor: 'var(--primary)', color: 'white' }}>
          <h3 style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Total Monthly Revenue</h3>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>₦1.64M</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Annual Run Rate (ARR)</h3>
          <div style={{ fontSize: '28px', fontWeight: 800 }}>₦19.6M</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Active Subscriptions</h3>
          <div style={{ fontSize: '28px', fontWeight: 800 }}>163</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <TrendingUp size={20} color="var(--purple)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Revenue Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>Subscriptions</span>
              <span style={{ fontWeight: 700 }}>₦800,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>Additional Locations</span>
              <span style={{ fontWeight: 700 }}>₦240,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>White Label Setup &amp; Maintenance</span>
              <span style={{ fontWeight: 700 }}>₦150,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>SMS Credits</span>
              <span style={{ fontWeight: 700 }}>₦450,000</span>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <CreditCard size={20} color="var(--blue)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Recent Transactions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Global Impact Ministries</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>SMS Top-up • Today 10:45 AM</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--green)' }}>+₦10,000</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
