"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Search, Filter } from 'lucide-react';
import '../../(dashboard)/main/main.css';

export default function TeamsPage() {
  const teams = [
    { id: 1, name: 'Evangelism Unit', org: 'Global Impact Ministries', loc: 'HQ Downtown', members: 45 },
    { id: 2, name: 'Welcome Team', org: 'City Lights Church', loc: 'Northside Campus', members: 12 },
    { id: 3, name: 'Outreach Volunteers', org: 'Hope Foundation NGO', loc: 'Westend Center', members: 30 },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="var(--orange)" /> 
            Teams
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View all teams across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search teams..." style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', width: '250px' }} />
          </div>
          <Button variant="outline"><Filter size={18} style={{ marginRight: '8px' }} /> Filters</Button>
        </div>
      </div>

      <Card className="table-card-premium" style={{ marginTop: 0 }}>
        <div className="table-responsive">
          <table className="data-table-premium" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Organization</th>
                <th>Location</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.org}</td>
                  <td>{t.loc}</td>
                  <td>{t.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
