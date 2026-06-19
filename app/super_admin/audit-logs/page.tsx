"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { History, Search, Filter } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function AuditLogsPage() {
  const logs = [
    { id: 1, admin: 'System', action: 'Created Organization "Grace Community"', timestamp: 'Oct 12, 2025 10:45 AM', ip: '192.168.1.1' },
    { id: 2, admin: 'David O.', action: 'Approved White Label for City Lights', timestamp: 'Oct 12, 2025 09:30 AM', ip: '10.0.0.45' },
    { id: 3, admin: 'Sarah T.', action: 'Suspended Organization "New Beginnings"', timestamp: 'Oct 11, 2025 04:15 PM', ip: '10.0.0.12' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={28} color="var(--primary)" /> 
            Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>System-wide administrative action logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search logs..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Timestamp</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.admin}</td>
                  <td>{log.action}</td>
                  <td>{log.timestamp}</td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
