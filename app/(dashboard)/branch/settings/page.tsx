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
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import './settings.css';

export default function BranchSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [adminName, setAdminName] = useState('John Doe');
  const [adminEmail, setAdminEmail] = useState('john@downtownhq.com');
  const [adminPhone, setAdminPhone] = useState('+234 801 234 5678');
  const [branchName, setBranchName] = useState('Downtown HQ');
  const [branchAddress, setBranchAddress] = useState('123 Organization Avenue, Lagos');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="hq-dashboard-premium">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <div className="header-badge">Location Config</div>
          <h1>Settings & Profile</h1>
          <p>Manage your administrative identity and location preferences.</p>
        </div>
        <div className="header-actions">
           <Button className="btn-premium" size="lg" onClick={handleSave} disabled={isSaving}>
              <Save size={18} style={{ marginRight: '8px' }} />
              {isSaving ? 'Saving...' : 'Save Changes'}
           </Button>
        </div>
      </header>

      {success && (
        <div className="success-alert-premium fade-in">
          <CheckCircle2 size={20} />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <div className="settings-layout-premium">
        {/* Administrative Profile */}
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
               <div className="avatar-circle-large">{adminName.charAt(0)}</div>
               <div className="avatar-controls">
                  <Button variant="outline" size="sm"><Camera size={16} /> Change Photo</Button>
                  <p>Recommended: Square JPG or PNG. Max 2MB.</p>
               </div>
            </div>

            <div className="settings-form-modern">
               <Input label="Full Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
               <Input label="Email Address" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
               <Input label="Phone Number" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
               <div className="read-only-field-premium">
                  <label>Administrative Role</label>
                  <div className="ro-box">Location Administrator</div>
               </div>
            </div>
          </Card>
        </section>

        {/* Location Identity */}
        <section className="settings-section-premium">
          <div className="section-title-group">
            <Building2 size={20} className="text-purple" />
            <div>
              <h3>Location Identity</h3>
              <p>Configure public branding and contact details for this campus.</p>
            </div>
          </div>

          <Card className="settings-card-content-premium">
            <div className="settings-form-modern">
               <Input label="Location Public Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
               <div className="read-only-field-premium">
                  <label>Public Outreach URL</label>
                  <div className="ro-box link">
                     <Globe size={14} /> vangly.app/f/downtown-hq
                  </div>
               </div>
               <div style={{ gridColumn: '1 / -1' }}>
                  <Input label="Physical Address" value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} />
               </div>
            </div>
          </Card>
        </section>

        {/* Notifications */}
        <section className="settings-section-premium">
          <div className="section-title-group">
            <Bell size={20} className="text-orange" />
            <div>
              <h3>Notifications</h3>
              <p>Stay updated on location growth and performance.</p>
            </div>
          </div>

          <Card className="settings-card-list-premium">
             {[
               { id: 'n1', title: 'New Member Alerts', desc: 'SMS notification when someone registers at your location.', active: true },
               { id: 'n2', title: 'Performance Reports', desc: 'Weekly summary of outreach and team growth.', active: true },
               { id: 'n3', title: 'Low Credit Warning', desc: 'Alert when SMS units drop below 500.', active: false },
             ].map(n => (
               <div key={n.id} className="settings-list-item-premium">
                  <div className="sli-info">
                     <h4>{n.title}</h4>
                     <p>{n.desc}</p>
                  </div>
                  <div className={`toggle-premium ${n.active ? 'active' : ''}`}>
                     <div className="toggle-thumb" />
                  </div>
               </div>
             ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
