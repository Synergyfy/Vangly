"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function WhiteLabelPage() {
  const requests = [
    { id: 1, org: 'Global Impact Ministries', domain: 'connect.globalimpact.org', status: 'Active', fee: 'Paid' },
    { id: 2, org: 'City Lights Church', domain: 'forms.citylights.org', status: 'Pending Setup', fee: 'Paid' },
    { id: 3, org: 'Hope Foundation', domain: 'join.hopefoundation.org', status: 'Awaiting Payment', fee: 'Unpaid' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={28} color="var(--purple)" /> 
          White Label Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Approve and configure white-label requests.</p>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Requested Domain</th>
                <th>Status</th>
                <th>Setup Fee (₦50k)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.org}</td>
                  <td><a href={`https://${r.domain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>{r.domain}</a></td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                      backgroundColor: r.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: r.status === 'Active' ? '#166534' : '#92400e'
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.fee === 'Paid' ? <CheckCircle2 size={16} color="var(--green)" /> : <XCircle size={16} color="var(--red)" />}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="outline" size="sm">Configure</Button>
                      {r.status === 'Pending Setup' && <Button className="btn-primary" size="sm">Approve</Button>}
                    </div>
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
