"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Save,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useAuth } from '@/services/auth';
import {
  useLocation,
  useUpdateLocation,
} from '@/services/manage-organization';
import { useFieldErrors } from '@/lib/forms/use-field-errors';
import { extractErrorMessage } from '@/lib/forms/extract-error-message';
import { toast } from 'sonner';
import './settings.css';

const NOTIFICATION_DEFAULTS = [
  { id: 'n1', title: 'New Member Alerts', desc: 'SMS notification when someone registers at your location.', active: true },
  { id: 'n2', title: 'Performance Reports', desc: 'Weekly summary of outreach and team growth.', active: true },
  { id: 'n3', title: 'Low Credit Warning', desc: 'Alert when SMS units drop below 500.', active: false },
];

export default function BranchSettingsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? undefined;
  const locationQuery = useLocation(branchId);
  const updateLocation = useUpdateLocation();

  const [adminName] = useState(user?.name ?? '');
  const [adminEmail] = useState('');
  const [adminPhone] = useState(user ? '' : '');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATION_DEFAULTS);
  const [showSuccess, setShowSuccess] = useState(false);

  const { errors, setError, clearAll } = useFieldErrors();
  const isSaving = updateLocation.isPending;

  useEffect(() => {
    if (locationQuery.data) {
      setBranchName(locationQuery.data.name);
      setBranchAddress(locationQuery.data.address ?? '');
    }
  }, [locationQuery.data]);

  const handleSave = async () => {
    clearAll();
    if (!branchId) {
      toast.error('No branch is associated with your account.');
      return;
    }
    if (!branchName.trim()) {
      setError('branchName', 'Branch name is required.');
      return;
    }
    try {
      await updateLocation.mutateAsync({
        id: branchId,
        input: {
          name: branchName.trim(),
          address: branchAddress.trim() || undefined,
        },
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not save your settings.'));
    }
  };

  const handleToggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n)),
    );
    toast.info('Notification preferences are not yet persisted to the backend.');
  };

  return (
    <div className="hq-dashboard-premium animate-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div>
            <div className="admin-badge-premium">Location Config</div>
            <h1>Settings &amp; Profile</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Manage your administrative identity and location preferences.</p>
          </div>
        </div>
        <div className="header-actions">
          <Button
            className="btn-premium"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={18} style={{ marginRight: '8px' }} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="settings-layout-premium">
        <section className="settings-section-premium">
          <div className="section-title-group">
            <User size={20} className="text-blue" />
            <div>
              <h3>Administrative Profile</h3>
              <p>How you appear to your teams and other administrators.</p>
            </div>
          </div>

          <Card className="settings-card-content-premium">
            <div className="avatar-upload-premium">
              <div className="avatar-circle-large">{(adminName || '?').charAt(0).toUpperCase()}</div>
              <div className="avatar-controls">
                <Button variant="outline" size="sm" disabled>
                  Change Photo
                </Button>
                <p>Profile photos are managed from your account settings.</p>
              </div>
            </div>

            <div className="settings-form-modern">
              <Input
                label="Full Name"
                value={adminName}
                readOnly
                disabled
              />
              <Input
                label="Email Address"
                value={adminEmail}
                placeholder="Add an email in account settings"
                readOnly
                disabled
              />
              <Input
                label="Phone Number"
                value={adminPhone}
                placeholder="+234..."
                readOnly
                disabled
              />
              <div className="read-only-field-premium">
                <label>Administrative Role</label>
                <div className="ro-box">Location Administrator</div>
              </div>
            </div>
          </Card>
        </section>

        <section className="settings-section-premium">
          <div className="section-title-group">
            <Building2 size={20} className="text-purple" />
            <div>
              <h3>Location Identity</h3>
              <p>Configure public branding and contact details for this campus.</p>
            </div>
          </div>

          <Card className="settings-card-content-premium">
            {locationQuery.isLoading ? (
              <p style={{ color: 'var(--text-tertiary)' }}>Loading location…</p>
            ) : (
              <div className="settings-form-modern">
                <Input
                  label="Location Public Name"
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value);
                    if (errors['branchName']) clearAll();
                  }}
                  error={errors['branchName']}
                  disabled={isSaving}
                />
                <div className="read-only-field-premium">
                  <label>Public Outreach URL</label>
                  <div className="ro-box link">
                    <Globe size={14} />{' '}
                    {locationQuery.data
                      ? `vangly.app/f/${locationQuery.data.id.slice(0, 8)}`
                      : 'vangly.app/f/your-location'}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Physical Address"
                    value={branchAddress}
                    placeholder="123 Organization Avenue, Lagos"
                    onChange={(e) => setBranchAddress(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="settings-section-premium">
          <div className="section-title-group">
            <Bell size={20} className="text-orange" />
            <div>
              <h3>Notifications</h3>
              <p>Stay updated on location growth and performance.</p>
            </div>
          </div>

          <Card className="settings-card-list-premium">
            {notifications.map((n) => (
              <div key={n.id} className="settings-list-item-premium">
                <div className="sli-info">
                  <h4>{n.title}</h4>
                  <p>{n.desc}</p>
                </div>
                <div
                  className={`toggle-premium ${n.active ? 'active' : ''}`}
                  onClick={() => handleToggleNotification(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleNotification(n.id);
                    }
                  }}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        icon="shield"
        title="Settings Updated"
        description="Your location settings have been saved."
        primaryAction={{ label: "Okay" }}
      />
    </div>
  );
}
