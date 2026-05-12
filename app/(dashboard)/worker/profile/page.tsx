"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, Building, Calendar, Edit3 } from 'lucide-react';
import './profile.css';
import '../worker.css';

export default function WorkerProfilePage() {
  const worker = {
    name: 'Alex Johnson',
    role: 'Evangelism Worker',
    email: 'alex.j@organization.com',
    phone: '+1 555 987 654',
    location: 'Northside Campus',
    joined: 'Jan 2024',
  };

  return (
    <div className="hq-dashboard">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Account</div>
          <h1>My Profile</h1>
          <p>Manage your worker information and settings.</p>
        </div>
      </div>

      <div className="profile-grid">
        <Card className="profile-card">
          <div className="profile-avatar-large">{worker.name.charAt(0)}</div>
          <div className="profile-info">
            <h2>{worker.name}</h2>
            <p>{worker.role}</p>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <span>Email</span>
              <span>{worker.email}</span>
            </div>
            <div className="detail-row">
              <span>Phone</span>
              <span>{worker.phone}</span>
            </div>
            <div className="detail-row">
              <span>Location</span>
              <span>{worker.location}</span>
            </div>
            <div className="detail-row">
              <span>Joined</span>
              <span>{worker.joined}</span>
            </div>
          </div>
          
          <Button className="btn-premium" style={{ marginTop: '24px', width: '100%' }}>
            <Edit3 size={16} /> Edit Profile
          </Button>
        </Card>

        <Card className="compose-main-card">
          <h3>Security & Settings</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '24px' }}>
            Manage your account credentials and notification preferences.
          </p>
          
          <div className="form-group-premium" style={{ marginBottom: '24px' }}>
            <label>Change Password</label>
            <Button variant="outline">Reset Password</Button>
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
