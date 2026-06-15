"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMe } from '@/services/auth';
import { Mail, Building, ShieldCheck, User as UserIcon } from 'lucide-react';
import type { UserRole } from '@/types/api/auth';
import './profile.css';
import '../worker.css';

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Harvite Super Admin',
  organization_admin: 'Organization Admin',
  location_admin: 'Location Admin',
  worker: 'Evangelism Worker',
};

export default function WorkerProfilePage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useMe();

  if (isLoading) {
    return (
      <div className="hq-dashboard">
        <div className="page-header flex-between">
          <div className="header-main">
            <div className="header-badge">Account</div>
            <h1>My Profile</h1>
            <p>Loading your account…</p>
          </div>
        </div>
        <div className="profile-grid">
          <Card className="profile-card">
            <div className="profile-avatar-large skeleton" />
            <div className="profile-info">
              <h2 className="skeleton-bar" />
              <p className="skeleton-bar short" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="hq-dashboard">
        <div className="page-header flex-between">
          <div className="header-main">
            <div className="header-badge">Account</div>
            <h1>My Profile</h1>
            <p>Could not load your account.</p>
          </div>
        </div>
        <Card className="profile-card">
          <p style={{ color: '#B42318', fontWeight: 600 }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button
            className="btn-premium"
            style={{ marginTop: '16px' }}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const initials = data.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Account</div>
          <h1>My Profile</h1>
          <p>Manage your account information and security.</p>
        </div>
      </div>

      <div className="profile-grid">
        <Card className="profile-card">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-info">
            <h2>{data.name}</h2>
            <p>{ROLE_LABELS[data.role]}</p>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span>
                <UserIcon size={14} /> User ID
              </span>
              <span>{data.id}</span>
            </div>
            <div className="detail-row">
              <span>
                <Building size={14} /> Organization
              </span>
              <span>{data.organization_id ?? '—'}</span>
            </div>
            <div className="detail-row">
              <span>Branch</span>
              <span>{data.branch_id ?? '—'}</span>
            </div>
            <div className="detail-row">
              <span>
                <Mail size={14} /> Role
              </span>
              <span>{ROLE_LABELS[data.role]}</span>
            </div>
            <div className="detail-row">
              <span>SMS Credits</span>
              <span>{data.credits.toLocaleString()}</span>
            </div>
          </div>

          <Button
            className="btn-premium"
            style={{ marginTop: '24px', width: '100%' }}
            onClick={() => router.push('/forgot-pin')}
          >
            <ShieldCheck size={16} /> Change PIN
          </Button>
        </Card>

        <Card className="compose-main-card">
          <h3>Security & Settings</h3>
          <p
            style={{
              color: 'var(--text-tertiary)',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            Manage your account credentials and notification preferences.
          </p>

          <div className="form-group-premium" style={{ marginBottom: '24px' }}>
            <label>Change PIN</label>
            <Button variant="outline" onClick={() => router.push('/forgot-pin')}>
              Reset PIN
            </Button>
          </div>

          <div className="form-group-premium">
            <label>Notifications</label>
            <div className="mode-options-stack">
              <div className="mode-option">
                <div className="mode-text">
                  <strong>SMS Reminders</strong>
                  <span>Receive alerts for new invitee updates.</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
