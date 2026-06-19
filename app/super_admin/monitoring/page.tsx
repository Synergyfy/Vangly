"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Server, Database, Cloud } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function MonitoringPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={28} color="var(--green)" /> 
          System Monitoring
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Check platform health and API endpoints.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Server size={24} color="var(--blue)" />
            <h3 style={{ margin: 0, fontSize: '18px' }}>Web Servers</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>99.99%</div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Uptime past 30 days. All systems operational.</p>
        </Card>

        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database size={24} color="var(--purple)" />
            <h3 style={{ margin: 0, fontSize: '18px' }}>Database Health</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>Healthy</div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Read replica lag: &lt; 5ms</p>
        </Card>

        <Card className="glass-morphism" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cloud size={24} color="var(--orange)" />
            <h3 style={{ margin: 0, fontSize: '18px' }}>SMS Gateway API</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>Operational</div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Latency: 42ms</p>
        </Card>
      </div>
    </div>
  );
}
