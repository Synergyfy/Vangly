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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock data for locations
  const locations = [
    { 
      id: 'l1', 
      name: 'HQ Location (Downtown)', 
      address: 'Lagos, Nigeria', 
      admins: 1, 
      groups: 6, 
      members: 145,
      url: 'https://vangly.com/f/hq-main' 
    },
    { 
      id: 'l2', 
      name: 'Northside Hub', 
      address: 'Abuja, Nigeria', 
      admins: 1, 
      groups: 4, 
      members: 82,
      url: 'https://vangly.com/f/northside' 
    },
    { 
      id: 'l3', 
      name: 'Westend Center', 
      address: 'Port Harcourt, Nigeria', 
      admins: 2, 
      groups: 3, 
      members: 54,
      url: 'https://vangly.com/f/westend' 
    },
    { 
      id: 'l4', 
      name: 'Southpark Office', 
      address: 'Lagos, Nigeria', 
      admins: 1, 
      groups: 2, 
      members: 28,
      url: 'https://vangly.com/f/southpark' 
    },
  ];

  const handleLocationClick = (location: any) => {
    router.push(`/main/manage-organization/location?id=${location.id}&name=${encodeURIComponent(location.name)}`);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => router.push('/main')} className="back-btn-pill">
            <ArrowLeft size={16} /> Back
          </Button>
          <div style={{ marginTop: '12px' }}>
            <div className="header-badge">Network Management</div>
            <h1>Organization Network</h1>
            <p>Manage all your organizational hubs and their guest access.</p>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={() => router.push('/main/manage-organization/new')} style={{ gap: '8px' }}>
            <Plus size={18} /> Add Location
          </Button>
        </div>
      </header>

      <div className="locations-layout">
        <div className="locations-grid-premium">
          {locations.map((location) => {
            const isExpanded = expandedId === location.id;
            return (
              <Card 
                key={location.id} 
                className={`location-card-premium ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleLocationClick(location)}
              >
                <div className="location-card-main">
                  <div className="location-info-section">
                    <div className="location-icon-box">
                      <Building2 size={24} />
                    </div>
                    <div className="location-details">
                      <h3>{location.name}</h3>
                      <div className="mobile-only-expand-toggle" onClick={(e) => toggleExpand(location.id, e)}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      <p className="desktop-only"><MapPin size={14} /> {location.address}</p>
                    </div>
                  </div>
                  <div className="location-card-quick-actions" style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px', color: 'var(--blue)', background: 'var(--blue-subtle)' }}
                      onClick={() => router.push(`/main/messages?target=location&name=${location.name}`)}
                      title="Send SMS to Location"
                    >
                      <MessageSquare size={20} />
                    </Button>
                  </div>
                </div>
                
                <div className={`location-card-content-expanded ${isExpanded ? 'show' : ''}`}>
                   <p className="mobile-address"><MapPin size={14} /> {location.address}</p>
                   <div className="location-stats-row">
                      <div className="location-stat">
                        <Building2 size={14} />
                        <span>{location.groups} Groups</span>
                      </div>
                      <div className="location-stat">
                        <Users size={14} />
                        <span>{location.members} Members</span>
                      </div>
                   </div>
                </div>

                   <div className="location-card-footer desktop-only">
                  <div className="location-stat">
                    <Building2 size={14} />
                    <span>{location.groups} Groups</span>
                  </div>
                  <div className="location-stat">
                    <Users size={14} />
                    <span>{location.members} Members</span>
                  </div>
                  <div className="view-link">
                    Manage <ChevronRight size={14} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="location-card-actions-mobile mobile-only">
                    <Button variant="primary" fullWidth onClick={() => handleLocationClick(location)}>
                      Manage Location
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
