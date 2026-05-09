"use client";

import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Camera, 
  Save,
  Lock,
  Smartphone,
  Mail,
  ChevronRight,
  Globe,
  MapPin
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './settings.css';

export default function BranchSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [adminName, setAdminName] = useState('John Doe');
  const [adminEmail, setAdminEmail] = useState('john@downtownhq.com');
  const [adminPhone, setAdminPhone] = useState('+234 801 234 5678');
  const [branchName, setBranchName] = useState('Downtown HQ');
  const [branchAddress, setBranchAddress] = useState('123 Church Avenue, Lagos');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="branch-settings-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Settings & Profile</h1>
            <p>Manage your personal account and branch identity.</p>
          </div>
          <Button className="btn-premium" style={{ gap: '0.75rem' }} onClick={handleSave} disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {success && (
        <div className="fade-in" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--green-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--green)' }}>
          <ShieldCheck size={20} style={{ color: 'var(--green)' }} />
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>Settings updated successfully!</span>
        </div>
      )}

      <div className="settings-layout">
        {/* Profile Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2><User size={20} style={{ color: 'var(--blue)' }} /> Administrative Profile</h2>
            <p>Update your personal information and how you appear to your team.</p>
          </div>
          <Card style={{ padding: '2rem' }}>
            <div className="avatar-upload-section">
              <div className="settings-avatar-preview">{adminName.charAt(0)}</div>
              <div>
                <Button variant="outline" size="sm" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Camera size={16} />
                  Change Avatar
                </Button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>
            <div className="settings-form-grid">
              <Input 
                label="Full Name" 
                value={adminName} 
                onChange={(e) => setAdminName(e.target.value)} 
              />
              <Input 
                label="Email Address" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
              />
              <Input 
                label="Phone Number" 
                value={adminPhone} 
                onChange={(e) => setAdminPhone(e.target.value)} 
              />
              <div className="input-wrapper">
                <label className="input-label">Administrative Role</label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', border: '1px solid var(--border-light)' }}>
                  Branch Administrator
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Branch Identity Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2><Building2 size={20} style={{ color: 'var(--purple)' }} /> Branch Identity</h2>
            <p>Manage the public information for your specific branch location.</p>
          </div>
          <Card style={{ padding: '2rem' }}>
            <div className="settings-form-grid">
              <Input 
                label="Branch Public Name" 
                value={branchName} 
                onChange={(e) => setBranchName(e.target.value)} 
              />
              <div className="input-wrapper">
                <label className="input-label">Branch Slug (for URLs)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', color: 'var(--text-tertiary)', fontSize: '0.875rem', border: '1px solid var(--border-light)' }}>
                  <Globe size={14} /> vangly.app/f/downtown-hq
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  label="Physical Address" 
                  value={branchAddress} 
                  onChange={(e) => setBranchAddress(e.target.value)} 
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2><Bell size={20} style={{ color: 'var(--orange)' }} /> Notification Preferences</h2>
            <p>Control when and how you receive updates about your branch.</p>
          </div>
          <Card style={{ padding: '0' }}>
            <div className="notification-item">
              <div className="notification-info">
                <h4>New Registration Alerts</h4>
                <p>Receive an SMS when a new member joins your branch.</p>
              </div>
              <div className="toggle-switch active">
                <div className="toggle-handle" />
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-info">
                <h4>Weekly Performance Reports</h4>
                <p>Get a summary of branch growth and worker performance via email.</p>
              </div>
              <div className="toggle-switch active">
                <div className="toggle-handle" />
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-info">
                <h4>Low Credit Warning</h4>
                <p>Notify me when SMS or Email credits drop below 500.</p>
              </div>
              <div className="toggle-switch active">
                <div className="toggle-handle" />
              </div>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2><Lock size={20} style={{ color: 'var(--red)' }} /> Security & Access</h2>
            <p>Manage your account security and authentication methods.</p>
          </div>
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '12px' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Two-Factor Authentication</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Secure your account with an extra layer of security.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '12px' }}>
                  <Smartphone size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Change Access PIN</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Last changed 3 months ago.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update PIN</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
