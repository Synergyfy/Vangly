"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Send } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function NotificationsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={28} color="var(--orange)" /> 
            Global Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Send announcements to all organization admins.</p>
        </div>
        <Button className="btn-primary"><Send size={18} style={{ marginRight: '8px' }}/> Send Announcement</Button>
      </div>

      <Card className="glass-morphism" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Past Announcements</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: 600 }}>New Subscription Plans Now Live!</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Sent: Oct 1, 2025</div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>We have updated our pricing structure to better serve organizations of all sizes...</p>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: 600 }}>Scheduled Maintenance</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Sent: Sep 15, 2025</div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>The SMS Gateway will undergo maintenance at 2 AM EST...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
