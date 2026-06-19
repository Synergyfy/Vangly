"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Send } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function MessagingPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageSquare size={28} color="var(--blue)" /> 
          Messaging &amp; SMS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor SMS delivery rates, usage, and revenue.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Total SMS Sent</h3>
          <div style={{ fontSize: '28px', fontWeight: 800 }}>1.2M</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Delivery Rate</h3>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--green)' }}>98.4%</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Top Country</h3>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Nigeria (85%)</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>SMS Revenue</h3>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>₦4.5M</div>
        </Card>
      </div>

      <Card className="glass-morphism" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Send size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', margin: 0 }}>Top Organizations by SMS Usage</h3>
        </div>
        <table className="data-table-premium" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Messages Sent</th>
              <th>Spend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Global Impact Ministries</td>
              <td>450,000</td>
              <td>₦1,500,000</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>City Lights Church</td>
              <td>210,000</td>
              <td>₦700,000</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
