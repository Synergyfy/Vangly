"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Building2,
  Users,
  Wallet,
  TrendingUp,
  PieChart,
  BarChart3,
  AlertTriangle,
  Globe,
  MapPin,
  ClipboardList
} from 'lucide-react';
import '../(dashboard)/main/main.css'; // Reuse some main css classes

export default function SuperAdminDashboard() {
  
  const mrr = 1250000;
  const additionalLocRev = 240000;
  const whiteLabelRev = 150000;
  const smsRev = 450000;

  const planDistribution = [
    { name: 'Free', count: 450, color: 'var(--text-tertiary)' },
    { name: 'Growth', count: 120, color: 'var(--blue)' },
    { name: 'Network', count: 35, color: 'var(--purple)' },
    { name: 'Enterprise', count: 8, color: 'var(--orange)' },
  ];

  const topOrgs = [
    { name: 'Global Impact Ministries', locations: 42, plan: 'Enterprise' },
    { name: 'City Lights Church', locations: 14, plan: 'Network' },
    { name: 'Hope Foundation NGO', locations: 8, plan: 'Network' },
  ];

  const nearLimits = [
    { name: 'Grace Community', used: 5, limit: 5, plan: 'Growth' },
    { name: 'New Life Centers', used: 14, limit: 15, plan: 'Network' },
    { name: 'Faith Outreach', used: 4, limit: 5, plan: 'Growth' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform-wide overview of growth, revenue, and active organizations.</p>
      </div>
      
      {/* Platform-wide Stats */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> Total Organizations</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>613</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--blue)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Total Locations</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>2,450</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--purple)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Total Users</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>14,500</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--orange)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={14} /> Total Responses</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>452k</div>
          </Card>
        </div>
      </section>

      {/* Revenue Summary */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Revenue Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} /> MRR</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>₦{(mrr/1000).toFixed(1)}k</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--blue)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> Addl. Locations</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>₦{(additionalLocRev/1000).toFixed(1)}k</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--purple)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> White Label</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>₦{(whiteLabelRev/1000).toFixed(1)}k</div>
          </Card>
          <Card className="glass-morphism" style={{ padding: '20px', borderLeft: '4px solid var(--orange)' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Wallet size={14} /> SMS Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>₦{(smsRev/1000).toFixed(1)}k</div>
          </Card>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Plan Distribution */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <PieChart size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Plan Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {planDistribution.map((plan, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: plan.color }}></div>
                  <span style={{ fontWeight: 600 }}>{plan.name}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{plan.count} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 400 }}>orgs</span></span>
              </div>
            ))}
          </div>
        </Card>

        {/* Near Limits */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <AlertTriangle size={20} color="var(--orange)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Organizations Near Location Limits</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nearLimits.map((org, i) => (
              <div key={i} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{org.name}</div>
                  <div style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>{org.plan}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Locations Used</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: org.used >= org.limit ? 'var(--orange)' : 'var(--text-primary)' }}>{org.used} / {org.limit}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Organizations */}
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <BarChart3 size={20} color="var(--blue)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>Top Organizations by Location Count</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topOrgs.map((org, i) => (
              <div key={i} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{org.name}</div>
                  <div style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white' }}>{org.plan}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Locations</span>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{org.locations}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
