"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Palette, 
  Globe, 
  Users, 
  ChevronRight, 
  ShieldCheck,
  Layout,
  ExternalLink
} from 'lucide-react';
import './settings.css';

export default function SettingsPage() {
  const router = useRouter();

  const settingsOptions = [
    {
      title: 'Brand Identity',
      description: 'Customize logos, colors, and the white-label experience for your community.',
      icon: <Palette size={24} />,
      href: '/main/brand',
      color: '#3b82f6',
      badge: 'Visuals'
    },
    {
      title: 'Custom Domain',
      description: 'Connect your own professional URL for a completely custom brand experience.',
      icon: <Globe size={24} />,
      href: '/main/settings/domain',
      color: '#8b5cf6',
      badge: 'Networking'
    },
    {
      title: 'Administrative Access',
      description: 'Manage roles, permissions, and security for your organization leads.',
      icon: <ShieldCheck size={24} />,
      href: '/main/manage-organization',
      color: '#10b981',
      badge: 'Security'
    }
  ];

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Organization Config</div>
          <h1>Global Settings</h1>
          <p>Configure your organization network's global preferences and white-labeling.</p>
        </div>
      </header>

      <div className="settings-grid-premium">
        {settingsOptions.map((option) => (
          <Card 
            key={option.title} 
            className="settings-card-premium"
            onClick={() => router.push(option.href)}
          >
            <div className="settings-card-header">
               <div className="settings-icon-box" style={{ background: `${option.color}15`, color: option.color }}>
                  {option.icon}
               </div>
               <span className="settings-badge-mini" style={{ color: option.color, background: `${option.color}10` }}>
                  {option.badge}
               </span>
            </div>
            <div className="settings-card-body">
               <h3>{option.title}</h3>
               <p>{option.description}</p>
            </div>
            <div className="settings-card-footer">
               <span>Configure Now</span>
               <ChevronRight size={18} />
            </div>
          </Card>
        ))}
      </div>

      <div className="settings-system-status">
         <Card className="status-banner-premium">
            <div className="status-indicator">
               <div className="pulse-dot" />
               <span>System Fully Operational</span>
            </div>
            <div className="status-content">
               <h4>Network Synchronized</h4>
               <p>All locations and team data are currently up to date across your organization.</p>
            </div>
            <Button variant="outline" size="sm" className="btn-status">View System Logs</Button>
         </Card>
      </div>
    </div>
  );
}
