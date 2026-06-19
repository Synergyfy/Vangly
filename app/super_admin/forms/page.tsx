"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Search, Filter } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function FormsPage() {
  const forms = [
    { id: 1, name: 'First Time Guest Connect', org: 'Global Impact Ministries', responses: 12450, conv: '45%' },
    { id: 2, name: 'Volunteer Sign Up', org: 'City Lights Church', responses: 840, conv: '22%' },
    { id: 3, name: 'Event Registration', org: 'Hope Foundation NGO', responses: 3200, conv: '68%' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={28} color="var(--green)" /> 
            Forms
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage forms platform-wide.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search forms..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Most Used Form</h3>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>First Time Guest Connect</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Most Active Form</h3>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Sunday Service Check-in</div>
        </Card>
        <Card className="glass-morphism" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Highest Converting</h3>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Event Registration (68%)</div>
        </Card>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Organization</th>
                <th>Responses</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>{f.org}</td>
                  <td>{f.responses.toLocaleString()}</td>
                  <td>{f.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
