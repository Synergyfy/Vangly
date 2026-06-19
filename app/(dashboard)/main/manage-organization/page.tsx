"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  ArrowUpRight,
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './management.css';

export default function LocationManagementPage() {
  const router = useRouter();
  
  const locations = [
    { id: 'l1', name: 'HQ Downtown', address: 'Lagos, Nigeria', teams: 6, members: 145, submissions: 850, status: 'High' },
    { id: 'l2', name: 'Northside Hub', address: 'Abuja, Nigeria', teams: 4, members: 82, submissions: 420, status: 'Medium' },
    { id: 'l3', name: 'Westend Center', address: 'Port Harcourt, Nigeria', teams: 3, members: 54, submissions: 180, status: 'Low' },
    { id: 'l4', name: 'Southpark Office', address: 'Lagos, Nigeria', teams: 2, members: 28, submissions: 95, status: 'Low' },
  ];

  const planLimit = 4; // Mock plan limit (e.g., Growth is 5, but let's mock hitting the limit for demonstration)
  const currentLocations = locations.length;
  const additionalPurchased = 0;
  const totalAllowed = planLimit + additionalPurchased;
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleLocationClick = (location: any) => {
    router.push(`/main/manage-organization/location?id=${location.id}&name=${encodeURIComponent(location.name)}`);
  };

  const handleCreateLocation = () => {
    if (currentLocations >= totalAllowed) {
      setShowUpgradeModal(true);
    } else {
      router.push('/main/manage-organization/new');
    }
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.push('/main')} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Organization Ops</div>
            <h1>Locations</h1>
            <p>Select a location to manage performance and teams.</p>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={handleCreateLocation} style={{ gap: '8px' }} className="btn-premium">
            <Plus size={18} /> Create Location
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
        {/* Usage Stats Component */}
        <section style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Plan</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Growth</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Locations</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{currentLocations} <span style={{ color: 'var(--text-muted)' }}>of {totalAllowed} Used</span></div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Additional Purchased</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{additionalPurchased}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Remaining</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: (totalAllowed - currentLocations) === 0 ? 'var(--orange)' : 'var(--text-primary)' }}>{totalAllowed - currentLocations}</div>
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.max(totalAllowed, currentLocations) }).map((_, idx) => (
                  <div key={idx} style={{ height: '8px', flex: 1, backgroundColor: idx < currentLocations ? (currentLocations >= totalAllowed ? 'var(--orange)' : 'var(--primary)') : 'var(--border-light)', borderRadius: '4px' }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="team-grid-premium">
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className="team-card-premium glass-morphism"
              onClick={() => handleLocationClick(location)}
            >
              <div className="team-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="stat-icon-box blue">
                    <Building2 size={20} />
                  </div>
                  <span className={`header-badge ${location.status === 'High' ? 'positive' : 'warning'}`}>
                    {location.status} Activity
                  </span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{location.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {location.address}
                  </p>
                </div>
              </div>

              <div className="team-card-content">
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '0' }}>
                  <div className="loc-stat-item">
                    <span className="stat-label">Teams</span>
                    <span className="stat-value" style={{ fontSize: '15px' }}>{location.teams}</span>
                  </div>
                  <div className="loc-stat-item">
                    <span className="stat-label">Members</span>
                    <span className="stat-value" style={{ fontSize: '15px' }}>{location.members}</span>
                  </div>
                  <div className="loc-stat-item">
                    <span className="stat-label">Activity</span>
                    <span className="stat-value" style={{ fontSize: '15px' }}>{location.submissions}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <Users size={14} />
                    <span>2 Managed Admins</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/main/messages?target=location&name=${location.name}`)} style={{ borderRadius: '10px' }}>
                      <MessageSquare size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" style={{ borderRadius: '10px' }}>
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#fff3ed' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--orange)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                <AlertTriangle size={24} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#9a3412', marginBottom: '8px' }}>You've Reached Your Location Limit</h2>
              <p style={{ fontSize: '14px', color: '#c2410c' }}>Your current plan includes up to {planLimit} locations.</p>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
                To create another location, you can either purchase an additional location or upgrade your plan.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/main/subscription/purchase')}>
                  Purchase Additional Location
                </Button>
                <Button className="btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/main/subscription')}>
                  Upgrade Plan to Network
                </Button>
                <Button variant="ghost" style={{ width: '100%' }} onClick={() => setShowUpgradeModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
