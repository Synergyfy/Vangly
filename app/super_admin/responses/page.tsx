"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClipboardList, Search, Filter } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function ResponsesPage() {
  const responses = [
    { id: 1, name: 'John Doe', form: 'First Time Guest Connect', org: 'Global Impact Ministries', date: 'Oct 12, 2025' },
    { id: 2, name: 'Jane Smith', form: 'Volunteer Sign Up', org: 'City Lights Church', date: 'Oct 12, 2025' },
    { id: 3, name: 'Mike Johnson', form: 'Event Registration', org: 'Hope Foundation NGO', date: 'Oct 11, 2025' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardList size={28} color="var(--primary)" /> 
            Contacts &amp; Responses
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View platform-wide response data.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search contacts..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Form Submitted</th>
                <th>Organization</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.form}</td>
                  <td>{r.org}</td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
