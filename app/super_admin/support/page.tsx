"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LifeBuoy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../../(dashboard)/main/main.css';

export default function SupportPage() {
  const router = useRouter();
  const tickets = [
    { id: 'TKT-001', org: 'Grace Community', issue: 'Cannot upgrade to Network Plan', priority: 'High', status: 'Open' },
    { id: 'TKT-002', org: 'Hope Foundation', issue: 'White label SSL error', priority: 'Critical', status: 'Open' },
    { id: 'TKT-003', org: 'City Lights', issue: 'Billing question', priority: 'Low', status: 'Resolved' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LifeBuoy size={28} color="var(--blue)" /> 
          Support &amp; Ticketing
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage platform support requests from organizations.</p>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Organization</th>
                <th>Issue Summary</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.id}</td>
                  <td>{t.org}</td>
                  <td>{t.issue}</td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                      backgroundColor: t.priority === 'Critical' ? '#fee2e2' : t.priority === 'High' ? '#fef3c7' : '#e0e7ff',
                      color: t.priority === 'Critical' ? '#991b1b' : t.priority === 'High' ? '#92400e' : '#3730a3'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td>{t.status}</td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/super_admin/support/${t.id}`)}>Reply</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
