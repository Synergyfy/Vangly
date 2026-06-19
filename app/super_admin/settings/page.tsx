"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Save } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function SettingsPage() {
  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} color="var(--text-secondary)" /> 
          Platform Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global system settings.</p>
      </div>

      <Card className="glass-morphism" style={{ padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>General Settings</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Platform Name</label>
            <input type="text" defaultValue="Harvite" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Support Email</label>
            <input type="email" defaultValue="support@harvite.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Enable Maintenance Mode</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Block all logins except Super Admins</span>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button className="btn-primary"><Save size={18} style={{ marginRight: '8px' }}/> Save Settings</Button>
      </div>
    </div>
  );
}
