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
      description: 'Customize logos, colors, and the overall look of your organization platform.',
      icon: <Palette size={24} />,
      href: '/main/brand',
      color: 'var(--blue)'
    },
    {
      title: 'Custom Domain',
      description: 'Connect your own domain (e.g. connect.myorganization.com) for a full white-label experience.',
      icon: <Globe size={24} />,
      href: '/main/settings/domain',
      color: 'var(--purple)'
    },
    {
      title: 'User Management',
      description: 'Manage administrative roles, permissions, and security settings.',
      icon: <Users size={24} />,
      href: '/main/manage-organization', // Reuse the location/admin management
      color: 'var(--green)'
    }
  ];

  return (
    <div className="hq-dashboard">
      <div className="page-header">
        <h1>Global Settings</h1>
        <p>Configure your organization network's global preferences and white-labeling.</p>
      </div>

      <div className="settings-options-grid">
        {settingsOptions.map((option) => (
          <Card 
            key={option.title} 
            className="settings-option-card clickable"
            onClick={() => router.push(option.href)}
          >
            <div className="option-icon" style={{ backgroundColor: `${option.color}15`, color: option.color }}>
              {option.icon}
            </div>
            <div className="option-content">
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
            <ChevronRight size={20} className="option-arrow" />
          </Card>
        ))}
      </div>

      <div className="settings-footer-info">
        <Card className="info-banner-card">
          <ShieldCheck size={20} className="text-primary" />
          <div className="banner-text">
            <h4>System Status: Fully Operational</h4>
            <p>Your organization network is currently synced across all locations.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {}}>View Logs <ExternalLink size={14} /></Button>
        </Card>
      </div>
    </div>
  );
}
