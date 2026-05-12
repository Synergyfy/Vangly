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
  Smartphone
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

  const handleLocationClick = (location: any) => {
    router.push(`/main/manage-organization/location?id=${location.id}&name=${encodeURIComponent(location.name)}`);
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
          <Button onClick={() => router.push('/main/manage-organization/new')} style={{ gap: '8px' }} className="btn-premium">
            <Plus size={18} /> Create Location
          </Button>
        </div>
      </header>

      <main className="dashboard-main-content">
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
    </div>
  );
}
